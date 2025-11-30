// src/app/api/user/cart/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const DB_NAME = 'BumbasKitchenDB';
const USERS_COLLECTION = 'users';
const MENU_COLLECTION = 'menuItems';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// হেল্পার: ইউজার আইডি বের করা
async function getUserId(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const decoded: any = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    return decoded._id;
  } catch { return null; }
}

// ১. কার্ট লোড করা (এবং স্টক চেক করা)
export async function GET(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    // ইউজারের সেভ করা কার্ট আনা
    const user = await db.collection(USERS_COLLECTION).findOne(
        { _id: new ObjectId(userId) },
        { projection: { cart: 1 } }
    );

    const savedCart = user?.cart || [];

    if (savedCart.length === 0) {
        return NextResponse.json({ success: true, items: [] });
    }

    // কার্টের আইটেমগুলোর বর্তমান ডিটেইলস মেনু থেকে আনা (লাইভ ডেটা)
    const productIds = savedCart.map((item: any) => new ObjectId(item.productId));
    const products = await db.collection(MENU_COLLECTION).find({
        _id: { $in: productIds }
    }).toArray();

    // লাইভ ডেটার সাথে কার্ট মার্জ করা
    const validatedCart = [];
    let cartChanged = false;

    for (const cartItem of savedCart) {
        const product = products.find(p => p._id.toString() === cartItem.productId);
        
        // লজিক: যদি প্রোডাক্ট পাওয়া যায় এবং স্টক থাকে (InStock === true)
        if (product && (product.InStock === true || product.InStock === "true")) {
            validatedCart.push({
                id: product._id.toString(),
                name: product.Name,
                price: product.Price,
                slug: product.Name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, ''),
                image: { 
                    url: (product.ImageURLs && product.ImageURLs.length > 0) ? product.ImageURLs[0] : '', 
                    alt: product.Name 
                },
                quantity: cartItem.quantity
            });
        } else {
            // যদি স্টক না থাকে, তবে আমরা এটি বাদ দিচ্ছি
            cartChanged = true;
        }
    }

    // যদি কোনো আইটেম আউট অফ স্টক হওয়ার কারণে বাদ পড়ে, তবে ডাটাবেসও আপডেট করে দেওয়া
    if (cartChanged) {
        const newDbCart = validatedCart.map(item => ({
            productId: item.id,
            quantity: item.quantity
        }));
        await db.collection(USERS_COLLECTION).updateOne(
            { _id: new ObjectId(userId) },
            { $set: { cart: newDbCart } }
        );
    }

    return NextResponse.json({ 
        success: true, 
        items: validatedCart,
        message: cartChanged ? "Some items were removed because they are out of stock." : "Cart loaded"
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ২. কার্ট সেভ/সিঙ্ক করা (POST)
export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { items } = await request.json(); // ফ্রন্টএন্ড থেকে পুরো কার্ট আসবে

    // আমরা শুধু ID এবং Quantity সেভ করব (ডেটা হালকা রাখার জন্য)
    const dbCart = items.map((item: any) => ({
        productId: item.id,
        quantity: item.quantity
    }));

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    await db.collection(USERS_COLLECTION).updateOne(
        { _id: new ObjectId(userId) },
        { $set: { cart: dbCart } }
    );

    return NextResponse.json({ success: true, message: 'Cart synced' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}