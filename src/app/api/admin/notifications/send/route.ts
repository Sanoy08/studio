// src/app/api/admin/notifications/send/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import webpush from 'web-push';
import jwt from 'jsonwebtoken';

const DB_NAME = 'BumbasKitchenDB';
const SUBSCRIPTIONS_COLLECTION = 'subscriptions';
const NOTIFICATIONS_COLLECTION = 'notifications';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

webpush.setVapidDetails(
  'mailto:info.bumbaskitchen@gmail.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

async function isAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  try {
    const decoded: any = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    return decoded.role === 'admin';
  } catch { return false; }
}

export async function POST(request: NextRequest) {
  try {
    if (!await isAdmin(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, message, image, link } = body;
    const url = link || '/';

    const payload = JSON.stringify({
      title: title,
      body: message,
      icon: '/icons/icon-192.png',
      image: image,
      url: url
    });

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    const subscriptions = await db.collection(SUBSCRIPTIONS_COLLECTION).find({}).toArray();
    
    const uniqueUserIds = new Set();
    subscriptions.forEach(sub => {
        if (sub.userId) uniqueUserIds.add(sub.userId.toString());
    });

    if (uniqueUserIds.size > 0) {
        const notificationsToSave = Array.from(uniqueUserIds).map(uid => ({
            userId: uid,
            title,
            message,
            link: url,
            image,
            isRead: false,
            createdAt: new Date()
        }));
        await db.collection(NOTIFICATIONS_COLLECTION).insertMany(notificationsToSave);
    }

    // এখানে পরিবর্তন করা হয়েছে: (sub: any) ব্যবহার করা হয়েছে
    const sendPromises = subscriptions.map((sub: any) => 
        webpush.sendNotification(sub, payload).catch(err => {
            if (err.statusCode === 410) {
                return db.collection(SUBSCRIPTIONS_COLLECTION).deleteOne({ _id: sub._id });
            }
        })
    );
    
    await Promise.all(sendPromises);

    return NextResponse.json({ 
        success: true, 
        message: `Sent to ${subscriptions.length} devices` 
    });

  } catch (error: any) {
    console.error("Notification Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}