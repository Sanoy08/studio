// src/app/api/admin/orders/status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendNotificationToUser } from '@/lib/notification';

const DB_NAME = 'BumbasKitchenDB';
const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';
const TRANSACTIONS_COLLECTION = 'coinTransactions';
const COUPONS_COLLECTION = 'coupons'; 

const SUCCESS_STATUSES = ['Received', 'Delivered'];

export async function PUT(request: NextRequest) {
  try {
    const { orderId, status } = await request.json();

    console.log(`[API] Updating Status: Order ${orderId} -> ${status}`);

    if (!orderId || !status) {
        return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const session = client.startSession();

    try {
        await session.withTransaction(async () => {
            
            const order = await db.collection(ORDERS_COLLECTION).findOne({ _id: new ObjectId(orderId) }, { session });
            
            if (!order) {
                console.error("[API] Order not found in DB");
                throw new Error("Order not found");
            }

            let orderUpdate: any = { Status: status }; 
            
            const couponCode = order.CouponCode;
            const orderCouponIncremented = order.couponUsageTracked === true;
            
            const isSuccessStatus = SUCCESS_STATUSES.includes(status);
            const isCancelled = status === 'Cancelled';
            
            // ★★★ ডিবাগ লগ ১: অর্ডারের কুপন সংক্রান্ত বর্তমান ডেটা ★★★
            console.log(`[DEBUG] Fetched Order State: CouponCode=${couponCode}, Tracked=${orderCouponIncremented}, New Status=${status}`);
            console.log(`[DEBUG] Calculated Conditions: isSuccessStatus=${isSuccessStatus}, isCancelled=${isCancelled}`);

            // --- কুপন ব্যবহারের ফিক্সড লজিক ---
            if (couponCode) {
                if (isSuccessStatus && !orderCouponIncremented) {
                    // ১. যদি স্ট্যাটাস 'Received' বা 'Delivered' হয় এবং কুপন ব্যবহার এখনো গণনা না করা হয়ে থাকে 
                    
                    // ★★★ ডিবাগ লগ ২: ইনক্রিমেন্ট প্রচেষ্টা ★★★
                    console.log(`[DEBUG] ACTION: Attempting to INCREMENT timesUsed for coupon: ${couponCode}`);
                    
                    await db.collection(COUPONS_COLLECTION).updateOne(
                        { code: couponCode },
                        { $inc: { timesUsed: 1 } },
                        { session }
                    );
                    orderUpdate.couponUsageTracked = true; 
                    console.log(`[API] Coupon ${couponCode} usage incremented for order ${orderId} on status ${status}.`);
                } else if (isCancelled && orderCouponIncremented) {
                    // ২. যদি 'Cancelled' হয় এবং আগে একবার গণনা করা হয়ে থাকে 
                    
                    // ★★★ ডিবাগ লগ ৩: ডিক্রিমেন্ট প্রচেষ্টা ★★★
                    console.log(`[DEBUG] ACTION: Attempting to DECREMENT timesUsed for coupon: ${couponCode}`);

                    await db.collection(COUPONS_COLLECTION).updateOne(
                        { code: couponCode },
                        { $inc: { timesUsed: -1 } },
                        { session }
                    );
                    orderUpdate.couponUsageTracked = false; 
                    console.log(`[API] Coupon ${couponCode} usage decremented for order ${orderId} on cancellation.`);
                } else {
                    // ★★★ ডিবাগ লগ ৪: কোন পরিবর্তন হচ্ছে না ★★★
                     console.log(`[DEBUG] ACTION: Coupon ${couponCode} used, but no change in timesUsed required for status ${status}.`);
                }
            } else {
                 console.log("[DEBUG] ACTION: No CouponCode found in order. Skipping coupon logic.");
            }
            // --- কুপন ব্যবহারের ফিক্সড লজিক শেষ ---
            
            // অর্ডারের স্ট্যাটাস এবং কুপন ট্র্যাকিং ফ্ল্যাগ আপডেট করা হলো
            // ★★★ ডিবাগ লগ ৫: অর্ডারে ফাইনাল $set পে লোড ★★★
            console.log("[DEBUG] Final $set payload for Order:", orderUpdate);
            
            await db.collection(ORDERS_COLLECTION).updateOne(
                { _id: new ObjectId(orderId) },
                { $set: orderUpdate },
                { session }
            );

            let userId = null;
            if (order.userId) {
                userId = new ObjectId(order.userId);
            }

            // --- লজিক: Earning (Delivered) ---
            if (status === 'Delivered') {
                
                if (userId && !order.coinsAwarded) {
                    const user = await db.collection(USERS_COLLECTION).findOne({ _id: userId }, { session });
                    
                    if (user) {
                        const orderTotal = parseFloat(order.FinalPrice) || 0;
                        const currentTotalSpent = (user.totalSpent || 0) + orderTotal;
                        
                        let newTier = "Bronze";
                        let earnRate = 2; 

                        if (currentTotalSpent >= 15000) { newTier = "Gold"; earnRate = 6; } 
                        else if (currentTotalSpent >= 5000) { newTier = "Silver"; earnRate = 4; }

                        const coinsEarned = Math.floor((orderTotal * earnRate) / 100);

                        if (coinsEarned > 0) {
                            await db.collection(USERS_COLLECTION).updateOne(
                                { _id: userId },
                                { 
                                    $inc: { "wallet.currentBalance": coinsEarned, "totalSpent": orderTotal },
                                    $set: { 
                                        "wallet.tier": newTier,
                                        "lastTransactionDate": new Date()
                                    }
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

                            sendNotificationToUser(client, userId.toString(), "🎉 Coins Earned!", `You earned ${coinsEarned} coins!`, '/account/wallet').catch(e => console.error("Notif Error", e));
                        }
                    }
                }
            }

            // --- লজিক: Refund (Cancelled) ---
            if (status === 'Cancelled' && userId && order.CoinsRedeemed > 0 && !order.coinsRefunded) {
                
                await db.collection(USERS_COLLECTION).updateOne(
                    { _id: userId },
                    { 
                        $inc: { "wallet.currentBalance": order.CoinsRedeemed },
                        $set: { "lastTransactionDate": new Date() }
                    },
                    { session }
                );

                await db.collection(TRANSACTIONS_COLLECTION).insertOne({
                    userId: userId,
                    type: 'refund',
                    amount: order.CoinsRedeemed,
                    description: `Refund for Cancelled Order #${order.OrderNumber}`,
                    createdAt: new Date()
                }, { session });

                await db.collection(ORDERS_COLLECTION).updateOne(
                    { _id: new ObjectId(orderId) },
                    { $set: { coinsRefunded: true } },
                    { session }
                );
                
                sendNotificationToUser(client, userId.toString(), "Coins Refunded", `${order.CoinsRedeemed} coins refunded.`, '/account/wallet').catch(console.error);
            }

            if (userId) {
                sendNotificationToUser(client, userId.toString(), `Order ${status}`, `Order #${order.OrderNumber} is now ${status}.`, '/account/orders').catch(console.error);
            }
        });

        return NextResponse.json({ success: true, message: `Status updated to ${status}` });

    } catch (error: any) {
        console.error("[API] Transaction Error:", error);
        // Transaction failed, log the error details
        console.error(`[DEBUG] Transaction Failed for Order ID: ${orderId}. Error Message: ${error.message}`);
        throw error;
    } finally {
        await session.endSession();
    }

  } catch (error: any) {
    console.error("[API] Global Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}