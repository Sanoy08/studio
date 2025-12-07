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
    const { orderId, status } = await request.json();

    console.log(`[API] Updating Status: Order ${orderId} -> ${status}`); // Debug Log 1

    if (!orderId || !status) {
        return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const session = client.startSession();

    try {
        await session.withTransaction(async () => {
            
            // ১. অর্ডার খোঁজা
            const order = await db.collection(ORDERS_COLLECTION).findOne({ _id: new ObjectId(orderId) }, { session });
            
            if (!order) {
                console.error("[API] Order not found in DB");
                throw new Error("Order not found");
            }

            // ২. স্ট্যাটাস আপডেট
            await db.collection(ORDERS_COLLECTION).updateOne(
                { _id: new ObjectId(orderId) },
                { $set: { Status: status } },
                { session }
            );

            // ইউজার আইডি চেক (এটি স্ট্রিং বা অবজেক্ট আইডি হতে পারে, তাই সেফ কনভারশন করছি)
            let userId = null;
            if (order.userId) {
                userId = new ObjectId(order.userId);
            }

            console.log(`[API] User ID found: ${userId ? userId.toString() : 'Guest User'}`); // Debug Log 2

            // --- লজিক: Earning (Delivered) ---
            if (status === 'Delivered') {
                
                if (!userId) {
                    console.log("[API] Skipping Coin Award: User is Guest (No User ID)");
                } else if (order.coinsAwarded) {
                    console.log("[API] Skipping Coin Award: Already Awarded");
                } else {
                    // ইউজার এবং বর্তমান খরচ বের করা
                    const user = await db.collection(USERS_COLLECTION).findOne({ _id: userId }, { session });
                    
                    if (user) {
                        const orderTotal = parseFloat(order.FinalPrice) || 0; // Safe number conversion
                        const currentTotalSpent = (user.totalSpent || 0) + orderTotal;
                        
                        console.log(`[API] Calculation: Order Total ${orderTotal}, Prev Spent ${user.totalSpent || 0}`); // Debug Log 3

                        // টায়ার লজিক
                        let newTier = "Bronze";
                        let earnRate = 2; // 2%

                        if (currentTotalSpent >= 15000) { newTier = "Gold"; earnRate = 6; } 
                        else if (currentTotalSpent >= 5000) { newTier = "Silver"; earnRate = 4; }

                        const coinsEarned = Math.floor((orderTotal * earnRate) / 100);

                        console.log(`[API] Coins Earned: ${coinsEarned} (Rate: ${earnRate}%)`); // Debug Log 4

                        if (coinsEarned > 0) {
                            // আপডেট ইউজার
                            await db.collection(USERS_COLLECTION).updateOne(
                                { _id: userId },
                                { 
                                    $inc: { "wallet.currentBalance": coinsEarned, "totalSpent": orderTotal },
                                    $set: { "wallet.tier": newTier }
                                },
                                { session }
                            );

                            // ইনসার্ট ট্রানজেকশন
                            await db.collection(TRANSACTIONS_COLLECTION).insertOne({
                                userId: userId,
                                type: 'earn',
                                amount: coinsEarned,
                                description: `Earned from Order #${order.OrderNumber}`,
                                createdAt: new Date()
                            }, { session });

                            // ফ্ল্যাগ আপডেট
                            await db.collection(ORDERS_COLLECTION).updateOne(
                                { _id: new ObjectId(orderId) },
                                { $set: { coinsAwarded: true } },
                                { session }
                            );

                            console.log("[API] Coins Successfully Awarded!"); // Debug Log 5

                            // নোটিফিকেশন
                            sendNotificationToUser(client, userId.toString(), "🎉 Coins Earned!", `You earned ${coinsEarned} coins!`, '/account/wallet').catch(e => console.error("Notif Error", e));
                        }
                    } else {
                        console.error("[API] User found in order but not in Users collection!");
                    }
                }
            }

            // --- লজিক: Refund (Cancelled) ---
            if (status === 'Cancelled' && userId && order.CoinsRedeemed > 0 && !order.coinsRefunded) {
                
                console.log(`[API] Refunding ${order.CoinsRedeemed} coins...`);

                await db.collection(USERS_COLLECTION).updateOne(
                    { _id: userId },
                    { $inc: { "wallet.currentBalance": order.CoinsRedeemed } },
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

            // স্ট্যাটাস চেঞ্জ নোটিফিকেশন
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