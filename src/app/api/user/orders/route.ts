// src/app/api/orders/user/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const DB_NAME = 'BumbasKitchenDB';
const ORDERS_COLLECTION = 'orders';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export async function GET(request: NextRequest) {
  try {
    // ১. টোকেন চেক করা (বাধ্যতামূলক)
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

    // ২. ডেটাবেস থেকে অর্ডার আনা
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    const orders = await db.collection(ORDERS_COLLECTION)
      .find({ userId: new ObjectId(userId) })
      .sort({ Timestamp: -1 }) // নতুন অর্ডার আগে দেখাবে
      .toArray();

    return NextResponse.json({ success: true, orders }, { status: 200 });

  } catch (error: any) {
    console.error("Get User Orders Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}