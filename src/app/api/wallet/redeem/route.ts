// src/app/api/wallet/redeem/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { sendNotificationToUser } from '@/lib/notification'; // নোটিফিকেশন ইউটিলিটি

const DB_NAME = 'BumbasKitchenDB';
const USERS_COLLECTION = 'users';
const TRANSACTIONS_COLLECTION = 'coinTransactions';
const COUPONS_COLLECTION = 'coupons';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// ১ কয়েন = ১ টাকা (লজিক)
const COIN_VALUE_MULTIPLIER = 1; 

export async function POST(request: NextRequest) {
  try {
    // ১. অথেন্টিকেশন চেক
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let userId;
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      userId = decoded._id;
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid Token' }, { status: 401 });
    }

    const { coinsToRedeem } = await request.json();
    const redeemAmount = parseInt(coinsToRedeem);

    if (!redeemAmount || redeemAmount < 10) {
        return NextResponse.json({ success: false, error: 'Minimum 10 coins required to redeem.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const session = client.startSession();

    try {
        // ২. ট্রানজেকশন শুরু (যাতে মাঝপথে এরর হলে রোলব্যাক হয়)
        await session.withTransaction(async () => {
            
            // ইউজারের বর্তমান ব্যালেন্স চেক
            const user = await db.collection(USERS_COLLECTION).findOne(
                { _id: new ObjectId(userId) },
                { session }
            );

            if (!user || (user.wallet?.currentBalance || 0) < redeemAmount) {
                throw new Error('Insufficient coin balance.');
            }

            // ব্যালেন্স থেকে কয়েন কমানো
            await db.collection(USERS_COLLECTION).updateOne(
                { _id: new ObjectId(userId) },
                { $inc: { "wallet.currentBalance": -redeemAmount } },
                { session }
            );

            // ইউনিক কুপন কোড তৈরি
            const couponCode = `REDEEM-${Date.now().toString().slice(-6)}`;
            const discountValue = redeemAmount * COIN_VALUE_MULTIPLIER;

            // কুপন কালেকশনে সেভ করা
            await db.collection(COUPONS_COLLECTION).insertOne({
                code: couponCode,
                discountType: 'flat',
                value: discountValue,
                minOrder: 0,
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // ৩০ দিন মেয়াদ
                isActive: true,
                isOneTime: true, // শুধুমাত্র একবার ব্যবহারযোগ্য
                userId: new ObjectId(userId), // স্পেসিফিক ইউজারের জন্য লক
                createdAt: new Date()
            }, { session });

            // ট্রানজেকশন হিস্ট্রিতে রেকর্ড রাখা
            await db.collection(TRANSACTIONS_COLLECTION).insertOne({
                userId: new ObjectId(userId),
                type: 'redeem',
                amount: redeemAmount,
                description: `Redeemed for ₹${discountValue} coupon (${couponCode})`,
                createdAt: new Date()
            }, { session });

            // ৩. ★★★ কাস্টমারকে নোটিফিকেশন পাঠানো ★★★
            // (নোট: session এর ভেতরে বাইরের API কল এড়ানো ভালো, তাই এটি transaction এর বাইরেও করা যেত, তবে এখানে রাখলে কনফার্মেশন নিশ্চিত হয়)
            sendNotificationToUser(
                client,
                userId,
                "Coins Redeemed! 🎟️",
                `You successfully redeemed ${redeemAmount} coins for a ₹${discountValue} coupon. Code: ${couponCode}`,
                '/account/wallet'
            ).catch(err => console.error("Notification failed:", err));
        });

        return NextResponse.json({ success: true, message: 'Coins redeemed successfully!' });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    } finally {
        await session.endSession();
    }

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}