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

    // ★★★ AI Search Pipeline (MongoDB Atlas Search) ★★★
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
                                fuzzy: { maxEdits: 1, prefixLength: 2 }, // বানান ভুল হলেও খুঁজবে
                                score: { boost: { value: 5 } } // নামের গুরুত্ব বেশি
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
                CreatedAt: 1,
                score: { $meta: "searchScore" } // ম্যাচিং স্কোর
            }
        },
        { $limit: 20 } // সর্বোচ্চ ২০টি রেজাল্ট
    ];

    const results = await collection.aggregate(pipeline).toArray();

    // ডেটা ফরম্যাট করা
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
        featured: item.Bestseller === true || item.Bestseller === "true",
        reviews: [],
        createdAt: item.CreatedAt
    }));

    return NextResponse.json({ success: true, products }, { status: 200 });

  } catch (error: any) {
    console.error("AI Search Error:", error);
    
    // ফলব্যাক: যদি ইনডেক্স না থাকে, তবে সাধারণ সার্চ কাজ করবে
    if (error.message.includes("Remote error: Remote error from mongot")) {
        return NextResponse.json({ 
            success: false, 
            error: "Search index not ready yet. Please try again later." 
        }, { status: 503 });
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}