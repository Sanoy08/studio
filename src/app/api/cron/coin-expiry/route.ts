// src/app/api/cron/coin-expiry/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { sendNotificationToUser } from '@/lib/notification';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const queryKey = searchParams.get('key');
    const CRON_SECRET = process.env.CRON_SECRET;

    if (authHeader !== `Bearer ${CRON_SECRET}` && queryKey !== CRON_SECRET) {
        return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('BumbasKitchenDB');
    const usersCollection = db.collection('users');
    const transactionsCollection = db.collection('coinTransactions'); // ★ নতুন কালেকশন রেফারেন্স

    // --- লজিক ১: মেয়াদ শেষ (Expire) ---
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const expiredUsers = await usersCollection.find({
        lastTransactionDate: { $lt: ninetyDaysAgo },
        "wallet.currentBalance": { $gt: 0 }
    }).toArray();

    for (const user of expiredUsers) {
        const amountToExpire = user.wallet.currentBalance;

        // ১. ট্রানজেকশন হিস্ট্রিতে এন্ট্রি যোগ করা (যাতে ওয়ালেটে দেখায়)
        if (amountToExpire > 0) {
            await transactionsCollection.insertOne({
                userId: user._id,
                type: 'expire', // নতুন টাইপ 'expire'
                amount: amountToExpire,
                description: 'Expired due to inactivity',
                createdAt: new Date()
            });
        }

        // ২. ব্যালেন্স জিরো করা
        await usersCollection.updateOne(
            { _id: user._id },
            { $set: { "wallet.currentBalance": 0 } }
        );
        
        // ৩. নোটিফিকেশন পাঠানো
        await sendNotificationToUser(
            client,
            user._id.toString(),
            "Coins Expired ⏳",
            `Your ${amountToExpire} coins have expired due to inactivity.`,
            '/account/wallet'
        );
    }

    // --- লজিক ২: ওয়ার্নিং (Warning) ---
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() - 83); 

    const warningUsers = await usersCollection.find({
        lastTransactionDate: { $lt: warningDate, $gt: ninetyDaysAgo }, 
        "wallet.currentBalance": { $gt: 0 }
    }).toArray();

    for (const user of warningUsers) {
        await sendNotificationToUser(
            client,
            user._id.toString(),
            "Coins Expiring Soon! ⏳",
            "Your coins will expire in 7 days. Order now to use them!",
            '/menus'
        );
    }

    return NextResponse.json({ 
        success: true, 
        message: `Executed Coin Expiry Job. Expired: ${expiredUsers.length}, Warned: ${warningUsers.length}` 
    });

  } catch (error: any) {
    console.error("Coin Expiry Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}