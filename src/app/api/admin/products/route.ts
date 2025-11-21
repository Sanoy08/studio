// src/app/api/admin/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const DB_NAME = 'BumbasKitchenDB';
const COLLECTION_NAME = 'menuItems'; // আপনার মেনু কালেকশনের নাম
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// হেল্পার: অ্যাডমিন চেক
async function isAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded.role === 'admin';
  } catch (e) {
    return false;
  }
}

// ১. সমস্ত প্রোডাক্ট পাওয়া (GET)
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const products = await db.collection(COLLECTION_NAME).find({}).toArray();

    // ফ্রন্টএন্ডের ফরম্যাটে ম্যাপ করা
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

// ২. নতুন প্রোডাক্ট যোগ করা (POST)
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
      ImageURLs: [imageUrl], // আপাতত একটা ইমেজ URL অ্যারে হিসেবে নিচ্ছি
      Bestseller: featured,
      InStock: inStock,
      CreatedAt: new Date()
    };

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const result = await db.collection(COLLECTION_NAME).insertOne(newProduct);

    if (result.acknowledged) {
      return NextResponse.json({ success: true, message: 'Product added successfully', productId: result.insertedId }, { status: 201 });
    } else {
      throw new Error('Failed to insert product');
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}