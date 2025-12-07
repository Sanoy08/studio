// src/app/api/admin/orders/status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendNotificationToUser } from '@/lib/notification';

const DB_NAME = 'BumbasKitchenDB';
const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';
const TRANSACTIONS_COLLECTION = 'coinTransactions';
const COUPONS_COLLECTION = 'coupons'; // NEW: Coupon collection name

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

                let userId = null;
                if (order.userId) {
                    userId = new ObjectId(order.userId);
                }
                
                const oldStatus = order.Status;
                // Assuming 'couponCode' is stored on the order object if a coupon was used
                const couponCode = order.couponCode; 
                // 'couponUsageCounted' is a new field on the order to track if 'timesUsed' was incremented for this order
                const couponUsageCounted = order.couponUsageCounted === true;
                
                // ----------------------------------------------------
                // --- NEW LOGIC: Coupon timesUsed Update (START) ---
                // ----------------------------------------------------

                if (couponCode) {
                    let timesUsedChange = 0;
                    let newCouponUsageCountedStatus = couponUsageCounted;

                    // স্ট্যাটাস যা যা হলে কুপনটিকে 'ব্যবহৃত' হিসাবে ধরা হবে
                    const CONFIRMATION_STATUSES = ['Received', 'Processing', 'Delivered'];

                    // 1. Increment Logic (বাড়ানো):
                    // যদি নতুন স্ট্যাটাস একটি কনফার্মেশন স্ট্যাটাস হয় এবং কুপন ব্যবহার এখনও কাউন্ট করা না হয়ে থাকে
                    // (অর্থাৎ, অর্ডারটি প্রথমবারের মতো Received/Processing/Delivered-এ যাচ্ছে)
                    if (CONFIRMATION_STATUSES.includes(status) && !couponUsageCounted) {
                        timesUsedChange = 1;
                        newCouponUsageCountedStatus = true;
                        console.log(`[COUPON] Incrementing usage for ${couponCode} (Transition to ${status}).`);
                    } 
                    
                    // 2. Decrement Logic (কমানো): 
                    // যদি নতুন স্ট্যাটাস 'Cancelled' হয় এবং কুপন ব্যবহার আগে কাউন্ট করা হয়েছিল
                    // (অর্থাৎ, Received হওয়ার পরে Cancel করা হয়েছে)
                    else if (status === 'Cancelled' && couponUsageCounted) {
                        // $inc: -1 ensures decrement
                        timesUsedChange = -1;
                        newCouponUsageCountedStatus = false;
                        console.log(`[COUPON] Decrementing usage for ${couponCode} (Transition to Cancelled).`);
                    }

                    if (timesUsedChange !== 0) {
                        
                        // কুপনের 'timesUsed' আপডেট করা
                        await db.collection(COUPONS_COLLECTION).updateOne(
                            { 
                                code: couponCode,
                                // Safety check: Only decrement if timesUsed > 0 to avoid negative values
                                ...(timesUsedChange === -1 && { timesUsed: { $gt: 0 } }) 
                            }, 
                            { 
                                $inc: { timesUsed: timesUsedChange } 
                            },
                            { session }
                        );

                        // অর্ডারে ফ্ল্যাগ আপডেট করা
                        await db.collection(ORDERS_COLLECTION).updateOne(
                            { _id: new ObjectId(orderId) },
                            { $set: { couponUsageCounted: newCouponUsageCountedStatus } },
                            { session }
                        );
                    }
                }
                
                // ----------------------------------------------------
                // --- NEW LOGIC: Coupon timesUsed Update (END) ---
                // ----------------------------------------------------


                // Existing Status Update
                await db.collection(ORDERS_COLLECTION).updateOne(
                    { _id: new ObjectId(orderId) },
                    { $set: { Status: status } },
                    { session }
                );

                // existing logic continues
                
                // --- লজিক: Earning (Delivered) ---
                if (status === 'Delivered') {
                    
                    if (userId && !order.coinsAwarded) {
                        const user = await db.collection(USERS_COLLECTION).findOne({ _id: userId }, { session });
                        
                        if (user) {
                            const orderTotal = parseFloat(order.FinalPrice) || 0;
                            const currentTotalSpent = (user.totalSpent || 0) + orderTotal;
                            
                            // টায়ার লজিক
                            let newTier = "Bronze";
                            let earnRate = 2;  

                            if (currentTotalSpent >= 15000) { newTier = "Gold"; earnRate = 6; } 
                            else if (currentTotalSpent >= 5000) { newTier = "Silver"; earnRate = 4; }

                            const coinsEarned = Math.floor((orderTotal * earnRate) / 100);

                            if (coinsEarned > 0) {
                                // ★★★ FIX: lastTransactionDate আপডেট করা হলো ★★★
                                await db.collection(USERS_COLLECTION).updateOne(
                                    { _id: userId },
                                    { 
                                        $inc: { "wallet.currentBalance": coinsEarned, "totalSpent": orderTotal },
                                        $set: { 
                                            "wallet.tier": newTier,
                                            "lastTransactionDate": new Date() // এই লাইনটি মিসিং ছিল
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
                    
                    // ★★★ FIX: Refund এর সময়ও lastTransactionDate আপডেট করা হলো ★★★
                    await db.collection(USERS_COLLECTION).updateOne(
                        { _id: userId },
                        { 
                            $inc: { "wallet.currentBalance": order.CoinsRedeemed },
                            $set: { "lastTransactionDate": new Date() } // আপডেট
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
            throw error;
        } finally {
            await session.endSession();
        }

    } catch (error: any) {
        console.error("[API] Global Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}