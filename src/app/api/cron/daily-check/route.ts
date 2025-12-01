// src/app/api/cron/daily-check/route.ts

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
    const ordersCollection = db.collection('orders');

    const today = new Date();
    const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
    const currentDay = today.getDate().toString().padStart(2, '0');
    const dateString = `-${currentMonth}-${currentDay}`;

    // ১. জন্মদিন
    const birthdayUsers = await usersCollection.find({
        dob: { $regex: dateString + '$' }
    }).toArray();

    for (const user of birthdayUsers) {
        await sendNotificationToUser(
            client,
            user._id.toString(),
            `Happy Birthday, ${user.name}! 🎂`,
            "Wishing you a delicious day! Treat yourself with a special meal.",
            '/menus'
        );
    }

    // ২. অ্যানিভার্সারি
    const anniversaryUsers = await usersCollection.find({
        anniversary: { $regex: dateString + '$' }
    }).toArray();

    for (const user of anniversaryUsers) {
        await sendNotificationToUser(
            client,
            user._id.toString(),
            `Happy Anniversary, ${user.name}! 🎉`,
            "Celebrate your special day with us.",
            '/menus'
        );
    }

    // ৩. ইনঅ্যাক্টিভ ইউজার (We Miss You)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeOrders = await ordersCollection.distinct("userId", {
        Timestamp: { $gte: thirtyDaysAgo }
    });

    const inactiveUsers = await usersCollection.find({
        _id: { $nin: activeOrders },
        role: 'customer'
    }).limit(50).toArray();

    for (const user of inactiveUsers) {
        await sendNotificationToUser(
            client,
            user._id.toString(),
            "We Miss You! 🥺",
            "It's been a while. Come back and check out what's new!",
            '/menus'
        );
    }

    return NextResponse.json({ 
        success: true, 
        message: `Processed Bday: ${birthdayUsers.length}, Anniv: ${anniversaryUsers.length}, Inactive: ${inactiveUsers.length}` 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}