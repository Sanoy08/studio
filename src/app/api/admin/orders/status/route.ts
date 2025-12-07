// src/app/api/admin/orders/status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendNotificationToUser } from '@/lib/notification'; // নোটিফিকেশন ফাংশন

const DB_NAME = 'BumbasKitchenDB';
const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';
const TRANSACTIONS_COLLECTION = 'coinTransactions';

export async function PUT(request: NextRequest) {
  try {
    const { orderId, status } = await request.json();

    if (!orderId || !status) {
        return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const session = client.startSession();

    try {
        await session.withTransaction(async () => {
            
            // ১. অর্ডারটি খুঁজে বের করি
            const order = await db.collection(ORDERS_COLLECTION).findOne({ _id: new ObjectId(orderId) }, { session });
            if (!order) throw new Error("Order not found");

            // ২. স্ট্যাটাস আপডেট করা
            await db.collection(ORDERS_COLLECTION).updateOne(
                { _id: new ObjectId(orderId) },
                { $set: { Status: status } },
                { session }
            );

            const userId = order.userId; // ইউজারের আইডি (যদি রেজিস্টার্ড ইউজার হয়)

            // --- লজিক ৩: ডেলিভার্ড হলে কয়েন দেওয়া (Earning) ---
            if (status === 'Delivered' && userId && !order.coinsAwarded) {
                
                const user = await db.collection(USERS_COLLECTION).findOne({ _id: userId }, { session });
                const currentTotalSpent = (user?.totalSpent || 0) + order.FinalPrice;
                
                let newTier = "Bronze";
                let earnRate = 2;

                if (currentTotalSpent >= 15000) { newTier = "Gold"; earnRate = 6; } 
                else if (currentTotalSpent >= 5000) { newTier = "Silver"; earnRate = 4; }

                const coinsEarned = Math.floor((order.FinalPrice * earnRate) / 100);

                if (coinsEarned > 0) {
                    await db.collection(USERS_COLLECTION).updateOne(
                        { _id: userId },
                        { 
                            $inc: { "wallet.currentBalance": coinsEarned, "totalSpent": order.FinalPrice },
                            $set: { "wallet.tier": newTier }
                        },
                        { session }
                    );

                    await db.collection(TRANSACTIONS_COLLECTION).insertOne({
                        userId: userId,
                        type: 'earn',
                        amount: coinsEarned,
                        description: `Earned from Order #${order.OrderNumber}`,
                        createdAt: new Date()
                    }, { session });

                    await db.collection(ORDERS_COLLECTION).updateOne(
                        { _id: new ObjectId(orderId) },
                        { $set: { coinsAwarded: true } },
                        { session }
                    );

                    // আর্নিং নোটিফিকেশন
                    sendNotificationToUser(client, userId.toString(), "🎉 Coins Earned!", `You earned ${coinsEarned} coins from Order #${order.OrderNumber}`, '/account/wallet').catch(console.error);
                }
            }

            // --- লজিক ৪: ক্যানসেল হলে রিফান্ড এবং নোটিফিকেশন (Refund Notification) ---
            if (status === 'Cancelled' && userId && order.CoinsRedeemed > 0 && !order.coinsRefunded) {
                
                // ওয়ালেটে কয়েন ফেরত
                await db.collection(USERS_COLLECTION).updateOne(
                    { _id: userId },
                    { $inc: { "wallet.currentBalance": order.CoinsRedeemed } },
                    { session }
                );

                // রিফান্ড হিস্ট্রি
                await db.collection(TRANSACTIONS_COLLECTION).insertOne({
                    userId: userId,
                    type: 'refund',
                    amount: order.CoinsRedeemed,
                    description: `Refund for Cancelled Order #${order.OrderNumber}`,
                    createdAt: new Date()
                }, { session });

                // ফ্ল্যাগ আপডেট
                await db.collection(ORDERS_COLLECTION).updateOne(
                    { _id: new ObjectId(orderId) },
                    { $set: { coinsRefunded: true } },
                    { session }
                );

                // ★★★ রিফান্ড নোটিফিকেশন পাঠানো হচ্ছে ★★★
                sendNotificationToUser(
                    client, 
                    userId.toString(), 
                    "💰 Coins Refunded", 
                    `${order.CoinsRedeemed} coins have been refunded to your wallet for Order #${order.OrderNumber}.`, 
                    '/account/wallet'
                ).catch(console.error);
            }

            // সাধারণ স্ট্যাটাস আপডেট নোটিফিকেশন
            if (userId) {
                sendNotificationToUser(
                    client, 
                    userId.toString(), 
                    `Order ${status}`, 
                    `Your order #${order.OrderNumber} is now ${status}.`, 
                    '/account/orders'
                ).catch(console.error);
            }
        });

        return NextResponse.json({ success: true, message: `Status updated to ${status}` });

    } catch (error: any) {
        throw error;
    } finally {
        await session.endSession();
    }

  } catch (error: any) {
    console.error("Status Update Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}