// src/app/api/admin/daily-special/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { revalidatePath } from 'next/cache';
import { pusherServer } from '@/lib/pusher';
import { sendNotificationToAllUsers } from '@/lib/notification';

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

// ১. বর্তমান স্পেশাল মেনু পাওয়া
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    // স্পেশাল ফ্ল্যাগ দিয়ে খোঁজা হচ্ছে
    const specialItem = await db.collection(COLLECTION_NAME).findOne({ isDailySpecial: true });

    if (!specialItem) {
        return NextResponse.json({ success: false, message: "No daily special set yet." });
    }

    return NextResponse.json({ 
        success: true, 
        data: {
            id: specialItem._id,
            name: specialItem.Name,
            price: specialItem.Price,
            description: specialItem.Description, // এটি স্ট্রিং হিসেবেই যাবে
            imageUrl: specialItem.ImageURLs?.[0] || '',
            inStock: specialItem.InStock
        }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ২. আপডেট বা তৈরি করা
export async function POST(request: NextRequest) {
  try {
    if (!await isAdmin(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, price, items, imageUrl, inStock, notifyUsers } = body;

    // আইটেম লিস্টকে ডেসক্রিপশন টেক্সটে রূপান্তর করা (বুলেট পয়েন্ট সহ)
    const description = items.map((item: string) => `• ${item}`).join('\n');

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // আপডেট অবজেক্ট
    const productData = {
        Name: name,
        Price: parseFloat(price),
        Description: description,
        Category: "Thali", // স্পেশাল ক্যাটাগরি
        ImageURLs: [imageUrl],
        InStock: inStock,
        isDailySpecial: true, // ★ এই ফ্ল্যাগটিই আসল ম্যাজিক
        Bestseller: false, // হোমপেজে আলাদা সেকশনে দেখাব, তাই বেস্টসেলারে দরকার নেই
        UpdatedAt: new Date()
    };

    // আগে থেকে আছে কি না চেক করা
    const existing = await collection.findOne({ isDailySpecial: true });

    if (existing) {
        await collection.updateOne({ _id: existing._id }, { $set: productData });
    } else {
        await collection.insertOne({ ...productData, CreatedAt: new Date() });
    }

    // ক্যাশ রিফ্রেশ
    revalidatePath('/menus');
    revalidatePath('/');

    // রিয়েল-টাইম আপডেট
    await pusherServer.trigger('menu-updates', 'product-changed', {
        message: "Daily Special Menu Updated! 🍛",
        type: 'update'
    });

    // নোটিফিকেশন (যদি অ্যাডমিন চায়)
    if (notifyUsers) {
        sendNotificationToAllUsers(
            client,
            "Today's Special! 🍛",
            `New ${name} is now available. Order before it runs out!`,
            '/'
        ).catch(console.error);
    }

    return NextResponse.json({ success: true, message: 'Daily menu updated successfully' });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}