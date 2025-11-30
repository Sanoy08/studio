// src/app/api/cart/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const DB_NAME = 'BumbasKitchenDB';
const COLLECTION_NAME = 'users';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// হেল্পার: ইউজার আইডি বের করা
async function getUserId(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const decoded: any = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    return decoded._id;
  } catch { return null; }
}

// ১. কার্ট পাওয়া (GET)
export async function GET(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ items: [] }); // লগইন না থাকলে খালি

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const user = await db.collection(COLLECTION_NAME).findOne(
        { _id: new ObjectId(userId) },
        { projection: { cart: 1 } }
    );

    return NextResponse.json({ 
        success: true, 
        items: user?.cart || [] 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ২. কার্ট সিঙ্ক/আপডেট করা (POST)
export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { items } = await request.json(); // ফ্রন্টএন্ড থেকে লেটেস্ট কার্ট আসবে

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // ইউজারের কার্ট আপডেট করা
    await db.collection(COLLECTION_NAME).updateOne(
        { _id: new ObjectId(userId) },
        { $set: { cart: items } }
    );

    return NextResponse.json({ success: true, message: 'Cart synced' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}