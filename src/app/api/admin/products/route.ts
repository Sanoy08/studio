// src/app/api/admin/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { revalidatePath } from 'next/cache'; // ★ ১. এই লাইনটি যোগ করা হয়েছে

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
    const { name, description, price, category, imageUrl, featured, inStock } = body;

    const newProduct = {
      Name: name,
      Description: description,
      Price: parseFloat(price),
      Category: category,
      ImageURLs: [imageUrl],
      Bestseller: featured,
      InStock: inStock,
      CreatedAt: new Date()
    };

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const result = await db.collection(COLLECTION_NAME).insertOne(newProduct);

    if (result.acknowledged) {
      // ★ ২. ক্যাশ ক্লিয়ার করা হচ্ছে
      revalidatePath('/menus'); // মেনু পেজ রিফ্রেশ হবে
      revalidatePath('/');      // হোমপেজ রিফ্রেশ হবে (বেস্টসেলার সেকশনের জন্য)
      
      return NextResponse.json({ success: true, message: 'Product added successfully', productId: result.insertedId }, { status: 201 });
    } else {
      throw new Error('Failed to insert product');
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}