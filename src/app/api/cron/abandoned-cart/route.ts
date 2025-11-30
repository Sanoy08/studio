// src/app/api/cron/abandoned-cart/route.ts

import { NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { sendNotificationToUser } from '@/lib/notification';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('BumbasKitchenDB');
    const usersCollection = db.collection('users');

    // ১২ ঘণ্টা আগের সময় বের করা
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

    // কাদের কার্টে আইটেম আছে কিন্তু ১২ ঘণ্টা ধরে আপডেট হয়নি?
    const abandonedUsers = await usersCollection.find({
        "cart.0": { $exists: true }, // কার্ট খালি নয়
        cartUpdatedAt: { $lt: twelveHoursAgo }, // শেষ আপডেট ১২ ঘণ্টা আগে
        abandonedCartNotified: { $ne: true } // এখনো নোটিফিকেশন পাঠানো হয়নি
    }).toArray();

    if (abandonedUsers.length === 0) {
        return NextResponse.json({ message: 'No abandoned carts found.' });
    }

    let notifiedCount = 0;

    for (const user of abandonedUsers) {
        // নোটিফিকেশন পাঠানো
        await sendNotificationToUser(
            client,
            user._id.toString(),
            "You left something delicious! 😋", // Title
            "Your cart is waiting for you. Complete your order before the items run out of stock!", // Body
            '/cart' // Link
        );

        // ফ্ল্যাগ আপডেট করা (যাতে বারবার একই নোটিফিকেশন না যায়)
        await usersCollection.updateOne(
            { _id: user._id },
            { $set: { abandonedCartNotified: true } }
        );
        
        notifiedCount++;
    }

    return NextResponse.json({ 
        success: true, 
        message: `Sent notifications to ${notifiedCount} users.` 
    });

  } catch (error: any) {
    console.error("Abandoned Cart Cron Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}