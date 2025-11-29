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
const NOTIFICATIONS_COLLECTION = 'notifications'; // ★ নতুন কালেকশন

// ১. নির্দিষ্ট ইউজারকে নোটিফিকেশন পাঠানো (এবং হিস্ট্রিতে সেভ করা)
export async function sendNotificationToUser(client: MongoClient, userId: string, title: string, body: string, url: string = '/') {
  try {
    const db = client.db(DB_NAME);
    
    // ★ ১. ডাটাবেসে নোটিফিকেশন সেভ করা (যাতে অ্যাপের নোটিফিকেশন পেজে দেখায়)
    await db.collection(NOTIFICATIONS_COLLECTION).insertOne({
        userId: new ObjectId(userId),
        title,
        message: body,
        link: url,
        isRead: false,
        createdAt: new Date()
    });

    // ★ ২. পুশ নোটিফিকেশন পাঠানো (ব্রাউজার/ফোনে)
    const subscriptions = await db.collection(SUBSCRIPTIONS_COLLECTION).find({ 
        userId: new ObjectId(userId) 
    }).toArray();

    if (subscriptions.length === 0) return;

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icons/icon-192.png',
      url
    });

    const promises = subscriptions.map(sub => 
        webpush.sendNotification(sub as any, payload).catch(err => {
            if (err.statusCode === 410) {
                // সাবস্ক্রিপশন নষ্ট হয়ে গেলে ডিলিট করে দেওয়া
                db.collection(SUBSCRIPTIONS_COLLECTION).deleteOne({ _id: sub._id });
            }
        })
    );

    await Promise.all(promises);
  } catch (error) {
    console.error("Error sending user notification:", error);
  }
}

// ২. সব অ্যাডমিনকে নোটিফিকেশন পাঠানো (যেমন: নতুন অর্ডার আসলে)
export async function sendNotificationToAdmins(client: MongoClient, title: string, body: string, url: string = '/admin/orders') {
  try {
    const db = client.db(DB_NAME);

    // সব অ্যাডমিন খুঁজে বের করা
    const admins = await db.collection(USERS_COLLECTION).find({ role: 'admin' }).toArray();
    const adminIds = admins.map(admin => admin._id);

    if (adminIds.length === 0) return;

    // ★ ১. সব অ্যাডমিনের নোটিফিকেশন হিস্ট্রিতে সেভ করা
    const notificationsToSave = adminIds.map(id => ({
        userId: id,
        title,
        message: body,
        link: url,
        isRead: false,
        createdAt: new Date()
    }));
    
    if (notificationsToSave.length > 0) {
        await db.collection(NOTIFICATIONS_COLLECTION).insertMany(notificationsToSave);
    }

    // ★ ২. পুশ নোটিফিকেশন পাঠানো
    const subscriptions = await db.collection(SUBSCRIPTIONS_COLLECTION).find({ 
        userId: { $in: adminIds } 
    }).toArray();

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icons/admin-icon-192.png',
      url
    });

    const promises = subscriptions.map(sub => 
        webpush.sendNotification(sub as any, payload).catch(err => {
            if (err.statusCode === 410) {
                db.collection(SUBSCRIPTIONS_COLLECTION).deleteOne({ _id: sub._id });
            }
        })
    );

    await Promise.all(promises);
  } catch (error) {
    console.error("Error sending admin notification:", error);
  }
}

// ৩. সবাইকে পাঠানো (ব্রডকাস্ট) - যেমন নতুন অফার বা মেনু
export async function sendNotificationToAllUsers(client: MongoClient, title: string, body: string, url: string = '/') {
    try {
        const db = client.db(DB_NAME);
        
        // ★ ১. সব ইউজারের হিস্ট্রিতে সেভ করা (যাদের অ্যাকাউন্ট আছে)
        const users = await db.collection(USERS_COLLECTION).find({}, { projection: { _id: 1 } }).toArray();
        
        if (users.length > 0) {
             const notificationsToSave = users.map(u => ({
                userId: u._id,
                title,
                message: body,
                link: url,
                isRead: false,
                createdAt: new Date()
            }));
            await db.collection(NOTIFICATIONS_COLLECTION).insertMany(notificationsToSave);
        }

        // ★ ২. পুশ পাঠানো (শুধুমাত্র সাবস্ক্রাইবারদের)
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