// src/app/api/admin/orders/status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendNotificationToUser } from '@/lib/notification';

const DB_NAME = 'BumbasKitchenDB';
const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';
const TRANSACTIONS_COLLECTION = 'coinTransactions';

export async function PUT(request: NextRequest) {
  try {
    const { orderId, status } = await request.json(); // orderId = _id (MongoDB ID)

    if (!orderId || !status) {
        return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const session = client.startSession();

    try {
        await session.withTransaction(async () => {
            
            // অর্ডারটি খুঁজে বের করি
            const order = await db.collection(ORDERS_COLLECTION).findOne({ _id: new ObjectId(orderId) }, { session });
            if (!order) throw new Error("Order not found");

            // স্ট্যাটাস আপডেট করা
            await db.collection(ORDERS_COLLECTION).updateOne(
                { _id: new ObjectId(orderId) },
                { $set: { Status: status } },
                { session }
            );

            const userId = order.userId; // ইউজারের আইডি (যদি রেজিস্টার্ড ইউজার হয়)

            // --- লজিক ১: ডেলিভার্ড হলে কয়েন দেওয়া (Earning) ---
            if (status === 'Delivered' && userId && !order.coinsAwarded) {
                
                // ইউজারের বর্তমান টোটাল খরচ
                const user = await db.collection(USERS_COLLECTION).findOne({ _id: userId }, { session });
                const currentTotalSpent = (user?.totalSpent || 0) + order.FinalPrice;
                
                // টায়ার ক্যালকুলেশন
                let newTier = "Bronze";
                let earnRate = 2; // Default 2%

                if (currentTotalSpent >= 15000) {
                    newTier = "Gold"; earnRate = 6;
                } else if (currentTotalSpent >= 5000) {
                    newTier = "Silver"; earnRate = 4;
                }

                // কয়েন ক্যালকুলেশন
                const coinsEarned = Math.floor((order.FinalPrice * earnRate) / 100);

                if (coinsEarned > 0) {
                    // ওয়ালেটে কয়েন যোগ করা
                    await db.collection(USERS_COLLECTION).updateOne(
                        { _id: userId },
                        { 
                            $inc: { "wallet.currentBalance": coinsEarned, "totalSpent": order.FinalPrice },
                            $set: { "wallet.tier": newTier }
                        },
                        { session }
                    );

                    // হিস্ট্রি যোগ করা
                    await db.collection(TRANSACTIONS_COLLECTION).insertOne({
                        userId: userId,
                        type: 'earn',
                        amount: coinsEarned,
                        description: `Earned from Order #${order.OrderNumber}`,
                        createdAt: new Date()
                    }, { session });

                    // ফ্ল্যাগ আপডেট (যাতে দুবার কয়েন না পায়)
                    await db.collection(ORDERS_COLLECTION).updateOne(
                        { _id: new ObjectId(orderId) },
                        { $set: { coinsAwarded: true } },
                        { session }
                    );

                    // নোটিফিকেশন
                    sendNotificationToUser(client, userId.toString(), "🎉 Coins Earned!", `You got ${coinsEarned} coins from your last order!`, '/account/wallet').catch(console.error);
                }
            }

            // --- লজিক ২: ক্যানসেল হলে কয়েন রিফান্ড (Refund) ---
            if (status === 'Cancelled' && userId && order.CoinsRedeemed > 0 && !order.coinsRefunded) {
                
                // ওয়ালেটে কয়েন ফেরত দেওয়া
                await db.collection(USERS_COLLECTION).updateOne(
                    { _id: userId },
                    { $inc: { "wallet.currentBalance": order.CoinsRedeemed } },
                    { session }
                );

                // হিস্ট্রি যোগ করা
                await db.collection(TRANSACTIONS_COLLECTION).insertOne({
                    userId: userId,
                    type: 'refund',
                    amount: order.CoinsRedeemed,
                    description: `Refund for Cancelled Order #${order.OrderNumber}`,
                    createdAt: new Date()
                }, { session });

                // ফ্ল্যাগ আপডেট (যাতে দুবার রিফান্ড না পায়)
                await db.collection(ORDERS_COLLECTION).updateOne(
                    { _id: new ObjectId(orderId) },
                    { $set: { coinsRefunded: true } },
                    { session }
                );

                // নোটিফিকেশন
                sendNotificationToUser(client, userId.toString(), "Coins Refunded", `${order.CoinsRedeemed} coins have been refunded to your wallet.`, '/account/wallet').catch(console.error);
            }

            // স্ট্যাটাস চেঞ্জ নোটিফিকেশন
            if (userId) {
                sendNotificationToUser(client, userId.toString(), `Order ${status}`, `Your order #${order.OrderNumber} is now ${status}.`, '/account/orders').catch(console.error);
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
