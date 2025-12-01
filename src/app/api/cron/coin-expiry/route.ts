// src/app/api/cron/coin-expiry/route.ts

import { NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { sendNotificationToUser } from '@/lib/notification';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('BumbasKitchenDB');
    const usersCollection = db.collection('users');

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // ১. যাদের ৯০ দিন হয়ে গেছে এবং কয়েন আছে
    const expiredUsers = await usersCollection.find({
        lastTransactionDate: { $lt: ninetyDaysAgo },
        "wallet.currentBalance": { $gt: 0 }
    }).toArray();

    for (const user of expiredUsers) {
        // ব্যালেন্স জিরো করা
        await usersCollection.updateOne(
            { _id: user._id },
            { $set: { "wallet.currentBalance": 0 } }
        );
        
        // নোটিফিকেশন পাঠানো
        await sendNotificationToUser(
            client,
            user._id.toString(),
            "Coins Expired ⏳",
            "Your coins have expired due to inactivity.",
            '/account/wallet'
        );
    }

    // ২. যাদের ৭ দিন বাকি আছে (ওয়ার্নিং)
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() - 83); // 90 - 7 = 83 দিন পার হয়েছে

    const warningUsers = await usersCollection.find({
        lastTransactionDate: { $lt: warningDate, $gt: ninetyDaysAgo }, // ৭ দিনের মধ্যে এক্সপায়ার হবে
        "wallet.currentBalance": { $gt: 0 }
    }).toArray();

    for (const user of warningUsers) {
        await sendNotificationToUser(
            client,
            user._id.toString(),
            "Coins Expiring Soon! ⏳",
            "Your coins will expire in 7 days. Use them now!",
            '/menus'
        );
    }

    return NextResponse.json({ 
        success: true, 
        message: `Expired: ${expiredUsers.length}, Warned: ${warningUsers.length}` 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}