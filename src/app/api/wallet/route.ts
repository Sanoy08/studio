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
    const userObjectId = new ObjectId(userId);

    // ইউজারের ওয়ালেট তথ্য আনা
    const user = await db.collection(USERS_COLLECTION).findOne(
        { _id: userObjectId },
        { projection: { wallet: 1, totalSpent: 1 } }
    );

    // ট্রানজেকশন হিস্ট্রি আনা
    const transactions = await db.collection(TRANSACTIONS_COLLECTION)
        .find({ userId: userObjectId })
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray();

    // ★★★ FIX: _id কে id তে ম্যাপ করা ★★★
    const formattedTransactions = transactions.map(txn => ({
        id: txn._id.toString(), // এটি ইউনিক কি হিসেবে ব্যবহার হবে
        type: txn.type,
        amount: txn.amount,
        description: txn.description,
        date: txn.createdAt
    }));

    return NextResponse.json({
        success: true,
        balance: user?.wallet?.currentBalance || 0,
        tier: user?.wallet?.tier || 'Bronze',
        totalSpent: user?.totalSpent || 0,
        transactions: formattedTransactions // ফিক্সড ডেটা পাঠানো হচ্ছে
    });

  } catch (error: any) {
    console.error("Wallet API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}