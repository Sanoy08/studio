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

    // MongoDB Atlas Search Pipeline
    const pipeline = [
        {
            $search: {
                index: 'menu_search_index', // আপনার তৈরি করা ইনডেক্সের নাম
                compound: {
                    should: [
                        {
                            autocomplete: {
                                query: query,
                                path: 'Name',
                                fuzzy: { maxEdits: 1, prefixLength: 2 },
                                score: { boost: { value: 5 } }
                            }
                        },
                        {
                            text: {
                                query: query,
                                path: 'Description',
                                fuzzy: { maxEdits: 1 }
                            }
                        },
                        {
                            text: {
                                query: query,
                                path: 'Category',
                                score: { boost: { value: 3 } }
                            }
                        }
                    ]
                }
            }
        },
        {
            $project: {
                _id: 1,
                Name: 1,
                Price: 1,
                Category: 1,
                Description: 1,
                ImageURLs: 1,
                InStock: 1,
                Bestseller: 1,
                score: { $meta: "searchScore" }
            }
        },
        { $limit: 20 }
    ];

    const results = await collection.aggregate(pipeline).toArray();

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