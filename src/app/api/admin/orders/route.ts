// src/app/api/admin/orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { sendNotificationToUser } from '@/lib/notification'; // নোটিফিকেশন ইউটিলিটি

const DB_NAME = 'BumbasKitchenDB';
const ORDERS_COLLECTION = 'orders';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// অ্যাডমিন চেক হেল্পার
async function isAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  try {
    const decoded: any = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    return decoded.role === 'admin';
  } catch { return false; }
}

// ১. সব অর্ডার লোড করা (GET)
export async function GET(request: NextRequest) {
  try {
    if (!await isAdmin(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    // লেটেস্ট অর্ডার সবার আগে দেখাবে
    const orders = await db.collection(ORDERS_COLLECTION)
      .find({})
      .sort({ Timestamp: -1 }) 
      .toArray();

    return NextResponse.json({ success: true, orders }, { status: 200 });

  } catch (error: any) {
    console.error("Admin Orders API Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// ২. অর্ডার স্ট্যাটাস আপডেট করা (PATCH)
export async function PATCH(request: NextRequest) {
  try {
    if (!await isAdmin(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, status } = await request.json();
    
    if (!orderId || !status) {
        return NextResponse.json({ success: false, error: 'Missing orderId or status' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    // অর্ডারটি প্রথমে খুঁজে বের করা (ইউজার আইডি পাওয়ার জন্য)
    const order = await db.collection(ORDERS_COLLECTION).findOne({ _id: new ObjectId(orderId) });
    
    if (!order) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // স্ট্যাটাস আপডেট করা
    await db.collection(ORDERS_COLLECTION).updateOne(
        { _id: new ObjectId(orderId) },
        { $set: { Status: status } }
    );

    // ★★★ কাস্টমারকে নোটিফিকেশন পাঠানো ★★★
    if (order.userId) {
        let message = `Your order #${order.OrderNumber} status updated to: ${status}`;
        let title = "Order Update 📦";

        if (status === 'Out for Delivery') {
             message = `Your food is on the way! 🛵 Order #${order.OrderNumber}`;
             title = "Order On The Way!";
        } else if (status === 'Delivered') {
             message = `Enjoy your meal! 😋 Order #${order.OrderNumber} delivered.`;
             title = "Order Delivered";
        } else if (status === 'Cooking') {
             message = `We are preparing your food! 🍳 Order #${order.OrderNumber}`;
             title = "Cooking Started";
        }

        // ব্যাকগ্রাউন্ডে নোটিফিকেশন পাঠানো (await না করলেও চলবে, তবে এরর হ্যান্ডলিংয়ের জন্য রাখা ভালো)
        await sendNotificationToUser(
            client,
            order.userId.toString(),
            title,
            message,
            '/account/orders' // ক্লিক করলে এই লিংকে যাবে
        );
    }

    return NextResponse.json({ success: true, message: 'Order status updated' }, { status: 200 });

  } catch (error: any) {
    console.error("Update Order Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}