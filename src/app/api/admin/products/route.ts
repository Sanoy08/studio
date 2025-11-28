// src/app/api/admin/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { revalidatePath } from 'next/cache';
import { pusherServer } from '@/lib/pusher'; // রিয়েল-টাইম আপডেটের জন্য
import { sendNotificationToAllUsers } from '@/lib/notification'; // পুশ নোটিফিকেশনের জন্য

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

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const products = await db.collection(COLLECTION_NAME).find({}).toArray();

    const formattedProducts = products.map(item => ({
      id: item._id.toString(),
      name: item.Name,
      description: item.Description,
      price: item.Price,
      category: { name: item.Category, id: item.Category?.toLowerCase() },
      // ইমেজ অ্যারে হ্যান্ডেলিং
      images: item.ImageURLs?.map((url: string, i: number) => ({ id: `img-${i}`, url, alt: item.Name })) || [],
      stock: item.InStock ? 100 : 0,
      featured: item.Bestseller === "true" || item.Bestseller === true,
    }));

    return NextResponse.json({ success: true, products: formattedProducts }, { status: 200 });
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
    const { name, description, price, category, imageUrls, featured, inStock } = body;

    // নতুন প্রোডাক্ট অবজেক্ট
    const newProduct = {
      Name: name,
      Description: description,
      Price: parseFloat(price),
      Category: category,
      // ইমেজ অ্যারে সঠিকভাবে সেভ করা হচ্ছে
      ImageURLs: Array.isArray(imageUrls) ? imageUrls : (imageUrls ? [imageUrls] : []),
      Bestseller: featured,
      InStock: inStock,
      CreatedAt: new Date()
    };

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const result = await db.collection(COLLECTION_NAME).insertOne(newProduct);

    if (result.acknowledged) {
      
      // ১. সার্ভার সাইড ক্যাশ রিফ্রেশ (On-Demand Revalidation)
      revalidatePath('/menus');
      revalidatePath('/');

      // ২. ক্লায়েন্ট সাইড রিয়েল-টাইম আপডেট (Pusher)
      // এটি বর্তমানে ব্রাউজ করছেন এমন ইউজারদের পেজ রিফ্রেশ করবে
      await pusherServer.trigger('menu-updates', 'product-changed', {
        message: `New dish "${name}" added to the menu!`,
        type: 'add'
      });

      // ৩. পুশ নোটিফিকেশন ব্রডকাস্ট (New Arrival)
      // এটি সব সাবস্ক্রাইব করা ইউজারের ডিভাইসে নোটিফিকেশন পাঠাবে
      try {
          await sendNotificationToAllUsers(
              client,
              "New Arrival! 🍲",
              `Check out our new dish: ${name}. Order now to taste the freshness!`,
              `/menus`
          );
      } catch (notifError) {
          console.error("Failed to broadcast new product notification:", notifError);
      }
      
      return NextResponse.json({ success: true, message: 'Product added successfully', productId: result.insertedId }, { status: 201 });
    } else {
      throw new Error('Failed to insert product');
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}