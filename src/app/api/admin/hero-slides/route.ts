// src/app/api/admin/hero-slides/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { revalidatePath } from 'next/cache'; // ★ ইমপোর্ট

const DB_NAME = 'BumbasKitchenDB';
const COLLECTION_NAME = 'heroSlides';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

async function isAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  try {
    const decoded: any = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    return decoded.role === 'admin';
  } catch { return false; }
}

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const slides = await db.collection(COLLECTION_NAME)
        .find({})
        .sort({ order: 1 })
        .toArray();

    const formattedSlides = slides.map(slide => ({
      id: slide._id.toString(),
      imageUrl: slide.imageUrl,
      clickUrl: slide.clickUrl,
      order: slide.order || 0
    }));

    return NextResponse.json({ success: true, slides: formattedSlides }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!await isAdmin(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const newSlide = {
      imageUrl: body.imageUrl,
      clickUrl: body.clickUrl,
      order: parseInt(body.order || '0'),
      createdAt: new Date()
    };

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const result = await db.collection(COLLECTION_NAME).insertOne(newSlide);

    if (result.acknowledged) {
      // ★ ক্যাশ ক্লিয়ার (শুধুমাত্র হোমপেজ)
      revalidatePath('/');
      
      return NextResponse.json({ success: true, message: 'Slide added successfully', slideId: result.insertedId }, { status: 201 });
    } else {
      throw new Error('Failed to add slide');
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}