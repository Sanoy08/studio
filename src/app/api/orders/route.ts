// src/app/api/orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { sendNotificationToAdmins, sendNotificationToUser } from '@/lib/notification';
import { pusherServer } from '@/lib/pusher';

const DB_NAME = 'BumbasKitchenDB';
const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';
const TRANSACTIONS_COLLECTION = 'coinTransactions';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// ১ কয়েন = ১ টাকা ডিসকাউন্ট
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

            // ২. কয়েন রিডিমশন লজিক (যদি ইউজার চায়)
            if (userIdToSave && orderData.useCoins) {
                const user = await db.collection(USERS_COLLECTION).findOne({ _id: userIdToSave }, { session });
                const userBalance = user?.wallet?.currentBalance || 0;

                // রুল: অর্ডারের ৫০% এর বেশি কয়েন দিয়ে দেওয়া যাবে না
                const maxRedeemableAmount = subtotal * 0.5; 
                const redeemableCoins = Math.floor(maxRedeemableAmount / COIN_VALUE);

                // কত কয়েন ব্যবহার হবে (ব্যালেন্স অথবা ম্যাক্স লিমিট, যেটা ছোট)
                coinsRedeemed = Math.min(userBalance, redeemableCoins);
                finalDiscount = coinsRedeemed * COIN_VALUE;

                if (coinsRedeemed > 0) {
                    // ব্যালেন্স কাটা হচ্ছে
                    await db.collection(USERS_COLLECTION).updateOne(
                        { _id: userIdToSave },
                        { $inc: { "wallet.currentBalance": -coinsRedeemed } },
                        { session }
                    );

                    // রিডিম হিস্ট্রি
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
            // (অন্য কুপন থাকলে সেটাও এখানে হ্যান্ডেল করা যায়, আপাতত কয়েন ফোকাসড)
            const finalPrice = subtotal - finalDiscount;

            // ৪. অর্ডার সেভ করা
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
                Discount: finalDiscount,
                CoinsRedeemed: coinsRedeemed,
                FinalPrice: finalPrice,
                Items: orderData.items, 
                Status: "Received"
            };

            await db.collection(ORDERS_COLLECTION).insertOne(newOrder, { session });

            // ৫. কয়েন আর্নিং এবং টায়ার আপডেট (Earning & Tier Logic)
            if (userIdToSave) {
                // ইউজারের বর্তমান টোটাল খরচ বের করা
                const user = await db.collection(USERS_COLLECTION).findOne({ _id: userIdToSave }, { session });
                const currentTotalSpent = (user?.totalSpent || 0) + finalPrice;
                
                // টায়ার ক্যালকুলেশন
                let newTier = "Bronze";
                let earnRate = 2; // 2%

                if (currentTotalSpent >= 15000) {
                    newTier = "Gold";
                    earnRate = 6; // 6%
                } else if (currentTotalSpent >= 5000) {
                    newTier = "Silver";
                    earnRate = 4; // 4%
                }

                // নতুন কয়েন ক্যালকুলেশন
                const coinsEarned = Math.floor((finalPrice * earnRate) / 100);

                // ইউজার আপডেট (ব্যালেন্স, টায়ার, টোটাল খরচ)
                await db.collection(USERS_COLLECTION).updateOne(
                    { _id: userIdToSave },
                    { 
                        $inc: { 
                            "wallet.currentBalance": coinsEarned,
                            "totalSpent": finalPrice
                        },
                        $set: { 
                            "wallet.tier": newTier,
                            "lastTransactionDate": new Date() // এক্সপায়ারির জন্য দরকার
                        }
                    },
                    { session }
                );

                // আর্নিং হিস্ট্রি
                if (coinsEarned > 0) {
                    await db.collection(TRANSACTIONS_COLLECTION).insertOne({
                        userId: userIdToSave,
                        type: 'earn',
                        amount: coinsEarned,
                        description: `Earned from Order #${orderNumber} (${newTier} Member)`,
                        createdAt: new Date()
                    }, { session });

                    // নোটিফিকেশন (কয়েন আর্ন)
                    // নোট: এটি ট্রানজেকশনের বাইরে কল করা নিরাপদ (fire and forget)
                    sendNotificationToUser(
                        client, 
                        userIdToSave.toString(), 
                        "🎉 Coins Earned!", 
                        `You earned ${coinsEarned} coins! You are now a ${newTier} member.`, 
                        '/account/wallet'
                    ).catch(console.error);
                }
            }

            // ৬. অর্ডার কনফার্মেশন এবং অ্যাডমিন অ্যালার্ট
            sendNotificationToAdmins(
                client,
                "New Order Received! 🛍️",
                `Order #${orderNumber} by ${orderData.name} - ₹${finalPrice}`,
                '/admin/orders'
            ).catch(console.error);

            if (userIdToSave) {
                sendNotificationToUser(
                    client,
                    userIdToSave.toString(),
                    "Order Placed! 🥘",
                    `Order #${orderNumber} received. We are preparing it!`,
                    '/account/orders'
                ).catch(console.error);
            }
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