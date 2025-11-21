// src/app/api/orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const DB_NAME = 'BumbasKitchenDB';
const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    // ১. ইউজার ভেরিফিকেশন (যদি লগইন করা থাকে)
    let userIdToSave: ObjectId | null = null;
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded._id) {
          userIdToSave = new ObjectId(decoded._id);
        }
      } catch (e) {
        console.warn("Invalid token, proceeding as guest.");
      }
    }

    // ২. অর্ডার নম্বর জেনারেট করা
    const orderNumber = `BK-${Date.now().toString().slice(-5)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // ৩. ডেটাবেস কানেকশন
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const ordersCollection = db.collection(ORDERS_COLLECTION);

    // ৪. অর্ডার ডকুমেন্ট তৈরি
    const newOrder = {
      OrderNumber: orderNumber,
      userId: userIdToSave, // লগইন করা থাকলে ID, না থাকলে null
      Timestamp: new Date(),
      Name: orderData.name,
      Phone: orderData.altPhone || orderData.phone, // চেকআউট ফর্মের ফিল্ড অনুযায়ী
      Address: orderData.address,
      DeliveryAddress: orderData.deliveryAddress || orderData.address,
      OrderType: orderData.deliveryAddress ? 'Delivery' : 'Pickup',
      MealTime: orderData.mealTime,
      PreferredDate: new Date(orderData.preferredDate),
      Instructions: orderData.instructions,
      // কার্ট থেকে আসা ডেটা
      Subtotal: parseFloat(orderData.subtotal),
      FinalPrice: parseFloat(orderData.total),
      Items: orderData.items, 
      Status: "Received"
    };

    // ৫. অর্ডার সেভ করা
    const result = await ordersCollection.insertOne(newOrder);

    if (result.acknowledged) {
      // TODO: Push Notification এবং Coin Earning লজিক এখানে যোগ করা যেতে পারে
      // আপাতত আমরা শুধু অর্ডার সেভ করছি।
      
      return NextResponse.json({ 
        success: true, 
        message: "Order placed successfully!",
        orderId: orderNumber
      }, { status: 201 });
    } else {
      throw new Error('Failed to insert order.');
    }

  } catch (error: any) {
    console.error("Order Save Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to place order.' },
      { status: 500 }
    );
  }
}