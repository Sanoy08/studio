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
    const { subscription, token } = await request.json();
    
    let userId = null;
    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userId = decoded._id;
      } catch (e) {
        console.warn("Invalid token during subscription");
      }
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const subscriptionData = {
      ...subscription,
      userId: userId ? new ObjectId(userId) : null,
      createdAt: new Date()
    };

    await db.collection(COLLECTION_NAME).updateOne(
      { endpoint: subscription.endpoint },
      { $set: subscriptionData },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}