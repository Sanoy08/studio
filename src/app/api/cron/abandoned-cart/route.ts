// src/app/api/cron/abandoned-cart/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { sendNotificationToUser } from '@/lib/notification';

export async function GET(request: NextRequest) {
  try {
    // ১. সিকিউরিটি চেক (CRON_SECRET)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('BumbasKitchenDB');
    const usersCollection = db.collection('users');

    // ১২ ঘণ্টা আগের সময়
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

    const abandonedUsers = await usersCollection.find({
        "cart.0": { $exists: true }, 
        cartUpdatedAt: { $lt: twelveHoursAgo }, 
        abandonedCartNotified: { $ne: true } 
    }).toArray();

    if (abandonedUsers.length === 0) {
        return NextResponse.json({ message: 'No abandoned carts found.' });
    }

    let notifiedCount = 0;

    for (const user of abandonedUsers) {
        await sendNotificationToUser(
            client,
            user._id.toString(),
            "You left something delicious! 😋",
            "Your cart is waiting. Complete your order before items run out!",
            '/cart'
        );

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
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}