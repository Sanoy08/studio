// src/app/api/products/[slug]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { Product } from '@/lib/types';

const DB_NAME = 'BumbasKitchenDB';
const COLLECTION_NAME = 'menuItems';

// Helper to convert name to slug (matches the logic in your other APIs)
const createSlug = (name: string) => 
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    // ১. সব প্রোডাক্ট নিয়ে আসা (স্লাগ ম্যাচ করার জন্য)
    // (MongoDB তে সরাসরি স্লাগ ফিল্ড থাকলে ভালো হতো, আপাতত আমরা ফিল্টার করছি)
    const allItems = await db.collection(COLLECTION_NAME).find({}).toArray();
    
    const productDoc = allItems.find(item => createSlug(item.Name) === slug);

    if (!productDoc) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // ২. প্রোডাক্ট ফরম্যাট করা
    const product: Product = {
      id: productDoc._id.toString(),
      name: productDoc.Name,
      slug: slug,
      description: productDoc.Description || '',
      price: productDoc.Price,
      category: { id: productDoc.Category?.toLowerCase(), name: productDoc.Category },
      images: productDoc.ImageURLs?.map((url: string, i: number) => ({ id: `img-${i}`, url, alt: productDoc.Name })) || [],
      rating: 4.5, // ডিফল্ট রেটিং (পরে রিভিউ সিস্টেম যোগ করা যাবে)
      reviewCount: 10,
      stock: productDoc.InStock ? 100 : 0,
      featured: productDoc.Bestseller === true,
      reviews: [],
      createdAt: productDoc.CreatedAt
    };

    // ৩. রিলেটেড প্রোডাক্ট বের করা (একই ক্যাটাগরির অন্য খাবার)
    const relatedDocs = allItems
        .filter(item => item.Category === productDoc.Category && item._id.toString() !== productDoc._id.toString())
        .slice(0, 4); // সর্বোচ্চ ৪টি

    const relatedProducts: Product[] = relatedDocs.map(item => ({
        id: item._id.toString(),
        name: item.Name,
        slug: createSlug(item.Name),
        description: item.Description,
        price: item.Price,
        category: { id: item.Category?.toLowerCase(), name: item.Category },
        images: item.ImageURLs?.map((url: string, i: number) => ({ id: `img-${i}`, url, alt: item.Name })) || [],
        rating: 4.5,
        reviewCount: 0,
        stock: item.InStock ? 100 : 0,
        featured: item.Bestseller === true,
        reviews: []
    }));

    return NextResponse.json({ success: true, product, relatedProducts }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}