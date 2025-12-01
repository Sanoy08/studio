// src/app/api/cron/coin-expiry/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { sendNotificationToUser } from '@/lib/notification';

export async function GET(request: NextRequest) {
  try {
    // ১. সিকিউরিটি চেক
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('BumbasKitchenDB');
    const usersCollection = db.collection('users');

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // ১. এক্সপায়ার করা
    const expiredUsers = await usersCollection.find({
        lastTransactionDate: { $lt: ninetyDaysAgo },
        "wallet.currentBalance": { $gt: 0 }
    }).toArray();

    for (const user of expiredUsers) {
        await usersCollection.updateOne(
            { _id: user._id },
            { $set: { "wallet.currentBalance": 0 } }
        );
        
        await sendNotificationToUser(
            client,
            user._id.toString(),
            "Coins Expired ⏳",
            "Your coins have expired due to inactivity.",
            '/account/wallet'
        );
    }

    // ২. ওয়ার্নিং পাঠানো (৭ দিন বাকি)
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