// src/app/api/admin/offers/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { revalidatePath } from 'next/cache'; // ★ ইমপোর্ট

const DB_NAME = 'BumbasKitchenDB';
const COLLECTION_NAME = 'offers';
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
    const offers = await db.collection(COLLECTION_NAME).find({}).toArray();

    const formattedOffers = offers.map(offer => ({
      id: offer._id.toString(),
      title: offer.title,
      description: offer.description,
      price: offer.price,
      imageUrl: offer.imageUrl,
      active: offer.active,
      createdAt: offer.createdAt
    }));

    return NextResponse.json({ success: true, offers: formattedOffers }, { status: 200 });
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
    
    const newOffer = {
      title: body.title,
      description: body.description,
      price: parseFloat(body.price),
      imageUrl: body.imageUrl,
      active: body.active ?? true,
      createdAt: new Date()
    };

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const result = await db.collection(COLLECTION_NAME).insertOne(newOffer);

    if (result.acknowledged) {
      // ★ ক্যাশ ক্লিয়ার
      revalidatePath('/');

      return NextResponse.json({ success: true, message: 'Offer created', offerId: result.insertedId }, { status: 201 });
    } else {
      throw new Error('Failed to create offer');
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}