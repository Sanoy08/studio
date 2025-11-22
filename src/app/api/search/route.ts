// src/app/api/search/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { Product } from '@/lib/types';

const DB_NAME = 'BumbasKitchenDB';
const COLLECTION_NAME = 'menuItems';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ success: false, error: 'Search query required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // আমরা 'Atlas Search' ($search) এর পরিবর্তে সাধারণ 'Regex' ($regex) ব্যবহার করছি।
    // এটি কোনো কনফিগারেশন ছাড়াই কাজ করবে।
    const regex = new RegExp(query, 'i'); // 'i' মানে ছোট/বড় হাতের অক্ষর ম্যাটার করবে না

    const results = await collection.find({
        $or: [
            { Name: { $regex: regex } },
            { Description: { $regex: regex } },
            { Category: { $regex: regex } }
        ]
    }).limit(20).toArray();

    // ফ্রন্টএন্ডের Product টাইপে কনভার্ট করা
    const products: Product[] = results.map((item: any) => ({
        id: item._id.toString(),
        name: item.Name,
        slug: item.Name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, ''),
        description: item.Description || '',
        price: item.Price,
        category: { id: item.Category?.toLowerCase(), name: item.Category },
        images: item.ImageURLs?.map((url: string, i: number) => ({ id: `img-${i}`, url, alt: item.Name })) || [],
        rating: 4.5,
        reviewCount: 0,
        stock: item.InStock ? 100 : 0,
        featured: item.Bestseller === true,
        reviews: []
    }));

    return NextResponse.json({ success: true, products }, { status: 200 });

  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}