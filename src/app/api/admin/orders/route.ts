// src/app/api/admin/orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const DB_NAME = 'BumbasKitchenDB';
const ORDERS_COLLECTION = 'orders';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// হেল্পার ফাংশন: অ্যাডমিন চেক করার জন্য
async function isAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    // টোকেনে রোল চেক করা (লগইন এর সময় আমরা রোল সেট করেছিলাম)
    return decoded.role === 'admin';
  } catch (e) {
    return false;
  }
}

// ১. সমস্ত অর্ডার পাওয়ার জন্য (GET)
export async function GET(request: NextRequest) {
  try {
    if (!await isAdmin(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admins only' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    // সব অর্ডার লেটেস্ট প্রথমে - এই অর্ডারে আনা
    const orders = await db.collection(ORDERS_COLLECTION)
      .find({})
      .sort({ Timestamp: -1 })
      .toArray();

    return NextResponse.json({ success: true, orders }, { status: 200 });

  } catch (error: any) {
    console.error("Admin Orders Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// ২. অর্ডারের স্ট্যাটাস আপডেট করার জন্য (PATCH)
export async function PATCH(request: NextRequest) {
  try {
    if (!await isAdmin(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, status } = await request.json();
    
    if (!orderId || !status) {
        return NextResponse.json({ success: false, error: 'Missing orderId or status' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    // আমরা অর্ডার নম্বর বা _id দিয়ে আপডেট করতে পারি। এখানে _id ব্যবহার করছি।
    const result = await db.collection(ORDERS_COLLECTION).updateOne(
        { _id: new ObjectId(orderId) },
        { $set: { Status: status } }
    );

    if (result.modifiedCount === 0) {
        return NextResponse.json({ success: false, error: 'Order not found or status not changed' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Order status updated' }, { status: 200 });

  } catch (error: any) {
    console.error("Update Order Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}