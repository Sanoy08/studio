// src/app/api/notifications/history/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const DB_NAME = 'BumbasKitchenDB';
const NOTIFICATIONS_COLLECTION = 'notifications';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export async function GET(request: NextRequest) {
  try {
    // ১. টোকেন ভেরিফিকেশন
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let userId;
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      userId = decoded._id;
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid Token' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const notificationsCollection = db.collection(NOTIFICATIONS_COLLECTION);

    // ২. নোটিফিকেশন খোঁজা (UserId স্ট্রিং বা অবজেক্ট আইডি হতে পারে)
    const notifications = await notificationsCollection.find({
        $or: [
            { userId: userId }, 
            { userId: new ObjectId(userId) }
        ]
    }).sort({ createdAt: -1 }).toArray();

    // ৩. আনরিড নোটিফিকেশন মার্ক করা
    const unreadIds = notifications.filter((n: any) => !n.isRead).map((n: any) => n._id);
    if (unreadIds.length > 0) {
        await notificationsCollection.updateMany(
            { _id: { $in: unreadIds } },
            { $set: { isRead: true } }
        );
    }

    return NextResponse.json({ success: true, notifications }, { status: 200 });

  } catch (error: any) {
    console.error("Notification History Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}