// src/app/api/admin/products/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const DB_NAME = 'BumbasKitchenDB';
const COLLECTION_NAME = 'menuItems';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

async function isAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  try {
    const decoded: any = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    return decoded.role === 'admin';
  } catch { return false; }
}

// ১. প্রোডাক্ট আপডেট করা (PUT)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!await isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    const body = await request.json();
    
    const updateData = {
      Name: body.name,
      Description: body.description,
      Price: parseFloat(body.price),
      Category: body.category,
      ImageURLs: [body.imageUrl],
      Bestseller: body.featured,
      InStock: body.inStock
    };

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return NextResponse.json({ success: true, message: 'Product updated' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ২. প্রোডাক্ট ডিলিট করা (DELETE)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!await isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}