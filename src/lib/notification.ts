// src/lib/notification.ts

import webpush from 'web-push';
import { MongoClient, ObjectId } from 'mongodb';

webpush.setVapidDetails(
  'mailto:info.bumbaskitchen@gmail.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const DB_NAME = 'BumbasKitchenDB';
const SUBSCRIPTIONS_COLLECTION = 'subscriptions';
const USERS_COLLECTION = 'users';

// ১. নির্দিষ্ট ইউজারকে পাঠানো
export async function sendNotificationToUser(client: MongoClient, userId: string, title: string, body: string, url: string = '/') {
  try {
    const db = client.db(DB_NAME);
    const subscriptions = await db.collection(SUBSCRIPTIONS_COLLECTION).find({ 
        userId: new ObjectId(userId) 
    }).toArray();

    if (subscriptions.length === 0) return;

    const payload = JSON.stringify({ title, body, icon: '/icons/icon-192.png', url });

    const promises = subscriptions.map(sub => 
        webpush.sendNotification(sub as any, payload).catch(err => {
            if (err.statusCode === 410) db.collection(SUBSCRIPTIONS_COLLECTION).deleteOne({ _id: sub._id });
        })
    );

    await Promise.all(promises);
  } catch (error) {
    console.error("Error sending user notification:", error);
  }
}

// ২. সব অ্যাডমিনকে পাঠানো
export async function sendNotificationToAdmins(client: MongoClient, title: string, body: string, url: string = '/admin/orders') {
  try {
    const db = client.db(DB_NAME);
    const admins = await db.collection(USERS_COLLECTION).find({ role: 'admin' }).toArray();
    const adminIds = admins.map(admin => admin._id);

    if (adminIds.length === 0) return;

    const subscriptions = await db.collection(SUBSCRIPTIONS_COLLECTION).find({ userId: { $in: adminIds } }).toArray();
    const payload = JSON.stringify({ title, body, icon: '/icons/admin-icon-192.png', url });

    const promises = subscriptions.map(sub => 
        webpush.sendNotification(sub as any, payload).catch(err => {
            if (err.statusCode === 410) db.collection(SUBSCRIPTIONS_COLLECTION).deleteOne({ _id: sub._id });
        })
    );
    await Promise.all(promises);
  } catch (error) {
    console.error("Error sending admin notification:", error);
  }
}

// ৩. ★★★ সবাইকে পাঠানো (Broadcast) ★★★
export async function sendNotificationToAllUsers(client: MongoClient, title: string, body: string, url: string = '/') {
    try {
        const db = client.db(DB_NAME);
        const subscriptions = await db.collection(SUBSCRIPTIONS_COLLECTION).find({}).toArray();

        const payload = JSON.stringify({ title, body, icon: '/icons/icon-192.png', url });

        const promises = subscriptions.map(sub => 
            webpush.sendNotification(sub as any, payload).catch(err => {
                if (err.statusCode === 410) db.collection(SUBSCRIPTIONS_COLLECTION).deleteOne({ _id: sub._id });
            })
        );
        await Promise.all(promises);
    } catch (error) {
        console.error("Error broadcasting notification:", error);
    }
}