// src/app/api/wallet/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const DB_NAME = 'BumbasKitchenDB';
const USERS_COLLECTION = 'users';
const TRANSACTIONS_COLLECTION = 'coinTransactions';
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

    // ২. ইউজারের বর্তমান ব্যালেন্স আনা
    const user = await db.collection(USERS_COLLECTION).findOne(
        { _id: new ObjectId(userId) },
        { projection: { wallet: 1 } }
    );

    const currentBalance = user?.wallet?.currentBalance || 0;

    // ৩. ট্রানজেকশন হিস্ট্রি আনা
    const transactions = await db.collection(TRANSACTIONS_COLLECTION)
        .find({ userId: new ObjectId(userId) })
        .sort({ createdAt: -1 }) // লেটেস্ট আগে
        .limit(20) // শেষ ২০টি ট্রানজেকশন
        .toArray();

    return NextResponse.json({ 
        success: true, 
        balance: currentBalance, 
        transactions 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}