// src/app/api/admin/coupons/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
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

// ★★★ কুপন আপডেট করার জন্য PUT মেথড ★★★
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!await isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // params await করা (Next.js 15)
    const { id } = await params;
    const body = await request.json();

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // আনলিমিটেড লজিক: যদি ফাঁকা বা ০ হয়, তবে null বা 0 সেট হবে
    const usageLimit = body.usageLimit ? parseInt(body.usageLimit) : 0; // 0 means unlimited
    const expiryDate = body.expiryDate ? body.expiryDate : null; // null means no expiry

    const updateData = {
      code: body.code.toUpperCase(),
      description: body.description,
      discountType: body.discountType,
      value: parseFloat(body.value),
      minOrder: parseFloat(body.minOrder || 0),
      usageLimit: usageLimit, 
      startDate: body.startDate,
      expiryDate: expiryDate,
      isActive: body.isActive
    };

    await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return NextResponse.json({ success: true, message: 'Coupon updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!await isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true, message: 'Coupon deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
