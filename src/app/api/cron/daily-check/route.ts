// src/app/api/cron/daily-check/route.ts

import { NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { sendNotificationToUser } from '@/lib/notification';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('BumbasKitchenDB');
    const usersCollection = db.collection('users');
    const ordersCollection = db.collection('orders');

    const today = new Date();
    const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
    const currentDay = today.getDate().toString().padStart(2, '0');
    const dateString = `-${currentMonth}-${currentDay}`; // e.g., "-11-25"

    // ১. জন্মদিনের উইশ
    const birthdayUsers = await usersCollection.find({
        dob: { $regex: dateString + '$' } // মেলায় মাস এবং দিন
    }).toArray();

    for (const user of birthdayUsers) {
        await sendNotificationToUser(
            client,
            user._id.toString(),
            `Happy Birthday, ${user.name}! 🎂`,
            "Wishing you a delicious day! Treat yourself with a special meal from us.",
            '/menus'
        );
    }

    // ২. অ্যানিভার্সারি উইশ
    const anniversaryUsers = await usersCollection.find({
        anniversary: { $regex: dateString + '$' }
    }).toArray();

    for (const user of anniversaryUsers) {
        await sendNotificationToUser(
            client,
            user._id.toString(),
            `Happy Anniversary, ${user.name}! 🎉`,
            "Celebrate your special day with a grand feast. Order now!",
            '/menus'
        );
    }

    // ৩. "We Miss You" (গত ৩০ দিনে অর্ডার করেনি)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // প্রথমে গত ৩০ দিনে যারা অর্ডার করেছে তাদের আইডি বের করি
    const activeOrders = await ordersCollection.distinct("userId", {
        Timestamp: { $gte: thirtyDaysAgo }
    });

    // এবার যারা অর্ডার করেনি তাদের খুঁজি (এবং যাদের অন্তত ১টা অর্ডার আছে অতীতে)
    // এটি ভারী কুয়েরি হতে পারে, তাই লিমিট দেওয়া ভালো
    const inactiveUsers = await usersCollection.find({
        _id: { $nin: activeOrders },
        role: 'customer'
    }).limit(50).toArray();

    for (const user of inactiveUsers) {
        await sendNotificationToUser(
            client,
            user._id.toString(),
            "We Miss You! 🥺",
            "It's been a while since we served you. Come back and check out what's new!",
            '/menus'
        );
    }

    return NextResponse.json({ 
        success: true, 
        messsage: `Processed: ${birthdayUsers.length} bdays, ${anniversaryUsers.length} annivs, ${inactiveUsers.length} inactive.` 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}