// src/app/api/admin/coupons/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const DB_NAME = 'BumbasKitchenDB';
const COLLECTION_NAME = 'coupons';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

async function isAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  try {
    const decoded: any = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    return decoded.role === 'admin';
  } catch { return false; }
}

// কুপন লিস্ট পাওয়া (GET)
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const coupons = await db.collection(COLLECTION_NAME).find({}).toArray();

    const formattedCoupons = coupons.map(c => ({
      id: c._id.toString(),
      code: c.code,
      discountType: c.discountType, // 'percentage' or 'flat'
      value: c.value,
      minOrder: c.minOrder,
      expiryDate: c.expiryDate,
      isActive: c.isActive
    }));

    return NextResponse.json({ success: true, coupons: formattedCoupons }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// নতুন কুপন তৈরি (POST)
export async function POST(request: NextRequest) {
  try {
    if (!await isAdmin(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // ভ্যালিডেশন: একই কোড যেন দুবার না থাকে
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const existingCoupon = await db.collection(COLLECTION_NAME).findOne({ code: body.code.toUpperCase() });
    
    if (existingCoupon) {
        return NextResponse.json({ success: false, error: 'Coupon code already exists' }, { status: 400 });
    }

    const newCoupon = {
      code: body.code.toUpperCase(),
      discountType: body.discountType, // 'percentage' | 'flat'
      value: parseFloat(body.value),
      minOrder: parseFloat(body.minOrder || 0),
      expiryDate: new Date(body.expiryDate),
      isActive: body.isActive ?? true,
      createdAt: new Date()
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(newCoupon);

    if (result.acknowledged) {
      return NextResponse.json({ success: true, message: 'Coupon created', couponId: result.insertedId }, { status: 201 });
    } else {
      throw new Error('Failed to create coupon');
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}