// src/app/api/orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { sendNotificationToAdmins, sendNotificationToUser } from '@/lib/notification';

const DB_NAME = 'BumbasKitchenDB';
const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';
const TRANSACTIONS_COLLECTION = 'coinTransactions';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

const COIN_VALUE = 1; 

export async function POST(request: NextRequest) {
   try {
    const orderData = await request.json();

    // ১. অথেন্টিকেশন
     let userIdToSave: ObjectId | null = null;
     const authHeader = request.headers.get('authorization');
     if (authHeader && authHeader.startsWith('Bearer ')) {
       const token = authHeader.split(' ')[1];
       try {
         const decoded: any = jwt.verify(token, JWT_SECRET);
         userIdToSave = new ObjectId(decoded._id);
       } catch (e) { console.warn("Invalid token"); }
     }

      const client = await clientPromise;
     const db = client.db(DB_NAME);
     const session = client.startSession();

     const orderNumber = `BK-${Date.now().toString().slice(-5)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

     try {
         await session.withTransaction(async () => {

             let finalDiscount = 0;
             let coinsRedeemed = 0;
             let subtotal = parseFloat(orderData.subtotal);

            // ২. কয়েন রিডিমশন (কাটা হবে, কিন্তু আর্ন হবে না)
            if (userIdToSave && orderData.useCoins) {
                const user = await db.collection(USERS_COLLECTION).findOne({ _id: userIdToSave }, { session });
                const userBalance = user?.wallet?.currentBalance || 0;

                const maxRedeemableAmount = subtotal * 0.5; 
                const redeemableCoins = Math.floor(maxRedeemableAmount / COIN_VALUE);

                coinsRedeemed = Math.min(userBalance, redeemableCoins);
                finalDiscount = coinsRedeemed * COIN_VALUE;

                if (coinsRedeemed > 0) {
                    // ওয়ালেট থেকে কয়েন কাটা হচ্ছে
                    await db.collection(USERS_COLLECTION).updateOne(
                        { _id: userIdToSave },
                        { $inc: { "wallet.currentBalance": -coinsRedeemed } },
                        { session }
                    );

                    // ট্রানজেকশন হিস্ট্রি (Redeem)
                    await db.collection(TRANSACTIONS_COLLECTION).insertOne({
                        userId: userIdToSave,
                        type: 'redeem',
                        amount: coinsRedeemed,
                        description: `Redeemed for Order #${orderNumber}`,
                        createdAt: new Date()
                    }, { session });
                }
            }

            // ৩. ফাইনাল প্রাইস ক্যালকুলেশন
            const finalPrice = subtotal - finalDiscount; 

            // ৪. অর্ডার সেভ করা (Status: Pending Verification)
            const newOrder = {
                OrderNumber: orderNumber,
                userId: userIdToSave,
                Timestamp: new Date(),
                Name: orderData.name,
                Phone: orderData.altPhone,
                Address: orderData.address,
                DeliveryAddress: orderData.deliveryAddress || orderData.address,
                OrderType: orderData.orderType || 'Delivery',
                MealTime: orderData.mealTime,
                PreferredDate: new Date(orderData.preferredDate),
                Instructions: orderData.instructions,
                Subtotal: subtotal,
                Discount: orderData.discount || finalDiscount, // টোটাল ডিসকাউন্ট সেভ করা
                CouponCode: orderData.couponCode, // ★★★ FIX: কুপন কোড যোগ করা হলো ★★★
                CoinsRedeemed: coinsRedeemed,
                FinalPrice: orderData.total, // ফ্রন্টএন্ড থেকে আসা ক্যালকুলেটেড টোটাল
                Items: orderData.items, 
                Status: "Pending Verification", 
                coinsAwarded: false, 
                coinsRefunded: false 
            };

            await db.collection(ORDERS_COLLECTION).insertOne(newOrder, { session });

            // ৫. নোটিফিকেশন
            sendNotificationToAdmins(
                client,
                "New Order (Pending) ⚠️",
                `Order #${orderNumber} needs verification.`,
                '/admin/orders'
            ).catch(console.error);

        });

        return NextResponse.json({ 
            success: true, 
            message: "Order placed successfully!",
            orderId: orderNumber
        }, { status: 201 });

    } catch (error: any) {
        throw error;
    } finally {
        await session.endSession();
    }

  } catch (error: any) {
    console.error("Order Save Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to place order.' },
      { status: 500 }
   
 );
  }
}