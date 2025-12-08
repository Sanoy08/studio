// src/lib/notification.ts

import admin from '@/lib/firebase-admin'; // আপনার তৈরি করা firebase-admin.ts ফাইল
import { MongoClient, ObjectId } from 'mongodb';

const DB_NAME = 'BumbasKitchenDB';
const SUBSCRIPTIONS_COLLECTION = 'subscriptions';
const USERS_COLLECTION = 'users';
const NOTIFICATIONS_COLLECTION = 'notifications';

// ১. নির্দিষ্ট ইউজারকে নোটিফিকেশন পাঠানো
export async function sendNotificationToUser(client: MongoClient, userId: string, title: string, body: string, url: string = '/') {
  try {
    const db = client.db(DB_NAME);
    const userIdObj = new ObjectId(userId);
    
    // ক) ডাটাবেসে নোটিফিকেশন হিস্ট্রি সেভ করা
    await db.collection(NOTIFICATIONS_COLLECTION).insertOne({
        userId: userIdObj,
        title,
        message: body,
        link: url,
        isRead: false,
        createdAt: new Date()
    });

    // খ) FCM টোকেন খুঁজে বের করা এবং নোটিফিকেশন পাঠানো
    const subscriptions = await db.collection(SUBSCRIPTIONS_COLLECTION).find({ 
        userId: userIdObj,
        type: 'fcm' // শুধুমাত্র অ্যাপ ইউজারদের জন্য
    }).toArray();

    if (subscriptions.length === 0) return;

    const promises: Promise<any>[] = [];

    for (const sub of subscriptions) {
        if (sub.token) {
            const message = {
                notification: {
                    title: title,
                    body: body,
                },
                data: {
                    link: url, // অ্যাপে রিডাইরেক্ট করার জন্য
                    userId: userId
                },
                token: sub.token,
            };
            
            promises.push(
                admin.messaging().send(message)
                    .catch(async (error: any) => {
                        console.error("FCM Send Error:", error.code);
                        // যদি টোকেন অকেজো হয়ে যায়, তবে ডাটাবেস থেকে মুছে ফেলা
                        if (error.code === 'messaging/invalid-registration-token' || 
                            error.code === 'messaging/registration-token-not-registered') {
                             await db.collection(SUBSCRIPTIONS_COLLECTION).deleteOne({ _id: sub._id });
                        }
                    })
            );
        }
    }

    await Promise.allSettled(promises);
  } catch (error) {
    console.error("Error sending user notification:", error);
  }
}

// ২. সব অ্যাডমিনকে নোটিফিকেশন পাঠানো
export async function sendNotificationToAdmins(client: MongoClient, title: string, body: string, url: string = '/admin/orders') {
  try {
    const db = client.db(DB_NAME);

    // সব অ্যাডমিন খুঁজে বের করা
    const admins = await db.collection(USERS_COLLECTION).find({ role: 'admin' }).toArray();
    const adminIds = admins.map(admin => admin._id);

    if (adminIds.length === 0) return;

    // ক) অ্যাডমিনদের হিস্ট্রিতে সেভ করা
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

    // খ) FCM এর মাধ্যমে পাঠানো
    const subscriptions = await db.collection(SUBSCRIPTIONS_COLLECTION).find({ 
        userId: { $in: adminIds },
        type: 'fcm'
    }).toArray();

    const promises: Promise<any>[] = [];

    for (const sub of subscriptions) {
        if (sub.token) {
            const message = {
                notification: { title, body },
                data: { link: url },
                token: sub.token,
            };
            
            promises.push(
                admin.messaging().send(message)
                    .catch(async (error: any) => {
                        if (error.code === 'messaging/invalid-registration-token' || 
                            error.code === 'messaging/registration-token-not-registered') {
                            await db.collection(SUBSCRIPTIONS_COLLECTION).deleteOne({ _id: sub._id });
                        }
                    })
            );
        }
    }

    await Promise.allSettled(promises);
  } catch (error) {
    console.error("Error sending admin notification:", error);
  }
}