// src/app/api/notifications/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const DB_NAME = 'BumbasKitchenDB';
const COLLECTION_NAME = 'subscriptions';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export async function POST(request: NextRequest) {
  try {
    const { token, type, jwtToken } = await request.json();

    if (!token || type !== 'fcm') {
        return NextResponse.json({ success: false }, { status: 400 });
    }

    // User Auth Check
    let userId = null;
    if (jwtToken) {
      try {
        const decoded: any = jwt.verify(jwtToken, JWT_SECRET);
        userId = decoded._id;
      } catch (e) {}
    }

    if (!userId) return NextResponse.json({ success: false }, { status: 401 });

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const userIdObj = new ObjectId(userId);

    // Remove old web-push
    await db.collection(COLLECTION_NAME).deleteMany({
      userId: userIdObj,
      $or: [{ type: 'webpush' }, { endpoint: { $exists: true } }]
    });

    // Save/Update FCM Token
    await db.collection(COLLECTION_NAME).updateOne(
        { token: token, userId: userIdObj },
        { $set: { token, type: 'fcm', userId: userIdObj, createdAt: new Date() } },
        { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}