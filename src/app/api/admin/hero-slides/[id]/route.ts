// src/app/api/admin/hero-slides/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import { revalidatePath } from 'next/cache'; // ★ ইমপোর্ট

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

function extractPublicId(imageUrl: string) {
    try {
        const regex = /\/v\d+\/(.+)\.\w+$/;
        const match = imageUrl.match(regex);
        return match ? match[1] : null;
    } catch (e) {
        return null;
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!await isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const slideToDelete = await collection.findOne({ _id: new ObjectId(id) });
    if (!slideToDelete) {
        return NextResponse.json({ success: false, error: 'Slide not found' }, { status: 404 });
    }

    if (slideToDelete.imageUrl) {
        const publicId = extractPublicId(slideToDelete.imageUrl);
        if (publicId) {
            try {
                await cloudinary.uploader.destroy(publicId);
            } catch (cloudError) {
                console.error("Cloudinary delete error:", cloudError);
            }
        }
    }

    await collection.deleteOne({ _id: new ObjectId(id) });

    // ★ ক্যাশ ক্লিয়ার
    revalidatePath('/');

    return NextResponse.json({ success: true, message: 'Slide deleted successfully' });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}