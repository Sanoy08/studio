// src/lib/notification.ts

import admin from '@/lib/firebase-admin'; 
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
    
    await db.collection(NOTIFICATIONS_COLLECTION).insertOne({
        userId: userIdObj,
        title,
        message: body,
        link: url,
        isRead: false,
        createdAt: new Date()
    });

    const subscriptions = await db.collection(SUBSCRIPTIONS_COLLECTION).find({ 
        userId: userIdObj, type: 'fcm' 
    }).toArray();

    if (subscriptions.length === 0) return;

    const promises: Promise<any>[] = [];
    for (const sub of subscriptions) {
        if (sub.token) {
            const message = {
                notification: { title, body },
                data: { link: url, userId },
                token: sub.token,
            };
            promises.push(
                admin.messaging().send(message).catch(async (e: any) => {
                    if (e.code === 'messaging/invalid-registration-token' || e.code === 'messaging/registration-token-not-registered') {
                         await db.collection(SUBSCRIPTIONS_COLLECTION).deleteOne({ _id: sub._id });
                    }
                })
            );
        }
    }
    await Promise.allSettled(promises);
  } catch (error) { console.error("Error sending user notification:", error); }
}

// ২. সব অ্যাডমিনকে নোটিফিকেশন পাঠানো
export async function sendNotificationToAdmins(client: MongoClient, title: string, body: string, url: string = '/admin/orders') {
  try {
    const db = client.db(DB_NAME);
    const admins = await db.collection(USERS_COLLECTION).find({ role: 'admin' }).toArray();
    const adminIds = admins.map(a => a._id);

    if (adminIds.length === 0) return;

    const notificationsToSave = adminIds.map(id => ({
        userId: id,
        title,
        message: body,
        link: url,
        isRead: false,
        createdAt: new Date()
    }));
    await db.collection(NOTIFICATIONS_COLLECTION).insertMany(notificationsToSave);

    const subscriptions = await db.collection(SUBSCRIPTIONS_COLLECTION).find({ 
        userId: { $in: adminIds }, type: 'fcm'
    }).toArray();

    const promises: Promise<any>[] = [];
    for (const sub of subscriptions) {
        if (sub.token) {
            const message = {
                notification: { title, body },
                data: { link: url },
                token: sub.token,
            };
            promises.push(admin.messaging().send(message).catch(() => {}));
        }
    }
    await Promise.allSettled(promises);
  } catch (error) { console.error("Error sending admin notification:", error); }
}

// ৩. সবাইকে পাঠানো (ব্রডকাস্ট) - ★★★ এটি মিসিং ছিল ★★★
export async function sendNotificationToAllUsers(client: MongoClient, title: string, body: string, url: string = '/') {
    try {
        const db = client.db(DB_NAME);
        
        // ১. সব ইউজারের হিস্ট্রিতে সেভ করা
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

        // ২. FCM টোকেন ব্যবহার করে পাঠানো
        const subscriptions = await db.collection(SUBSCRIPTIONS_COLLECTION).find({ type: 'fcm' }).toArray();

        const promises: Promise<any>[] = [];
        for (const sub of subscriptions) {
            if (sub.token) {
                const message = {
                    notification: { title, body },
                    data: { link: url },
                    token: sub.token,
                };
                promises.push(
                    admin.messaging().send(message).catch(async (e: any) => {
                        if (e.code === 'messaging/invalid-registration-token' || e.code === 'messaging/registration-token-not-registered') {
                            await db.collection(SUBSCRIPTIONS_COLLECTION).deleteOne({ _id: sub._id });
                        }
                    })
                );
            }
        }
        await Promise.allSettled(promises);
    } catch (error) { console.error("Error broadcasting notification:", error); }
}