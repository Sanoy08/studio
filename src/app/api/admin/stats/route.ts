// src/app/api/admin/stats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const DB_NAME = 'BumbasKitchenDB';
const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';
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
    if (!await isAdmin(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // ১. মোট রেভিনিউ এবং মোট অর্ডার সংখ্যা
    // MongoDB Aggregation ব্যবহার করে সব অর্ডারের 'FinalPrice' যোগ করা হচ্ছে
    const orderStats = await db.collection(ORDERS_COLLECTION).aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$FinalPrice" },
          totalOrders: { $count: {} }
        }
      }
    ]).toArray();

    const revenue = orderStats[0]?.totalRevenue || 0;
    const totalOrders = orderStats[0]?.totalOrders || 0;

    // ২. মোট কাস্টমার সংখ্যা
    const totalCustomers = await db.collection(USERS_COLLECTION).countDocuments({ role: 'customer' });

    // ৩. পেন্ডিং অর্ডার (Active Now এর বদলে আমরা পেন্ডিং অর্ডার দেখাবো যা বেশি জরুরি)
    const pendingOrders = await db.collection(ORDERS_COLLECTION).countDocuments({ 
      Status: { $in: ['Received', 'Cooking'] } 
    });

    // ৪. চার্টের জন্য গত ৬ মাসের সেলস ডেটা
    // এটি একটু জটিল কুয়েরি, আপাতত আমরা সিম্পল রাখার জন্য সব অর্ডার এনে প্রসেস করছি
    // (বড় অ্যাপে এটা ডাটাবেস লেভেলে করা উচিত)
    const allOrders = await db.collection(ORDERS_COLLECTION)
        .find({})
        .project({ Timestamp: 1, FinalPrice: 1 })
        .toArray();

    // মাস অনুযায়ী ডেটা প্রসেসিং
    const monthlySales: Record<string, number> = {};
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    allOrders.forEach((order: any) => {
        const date = new Date(order.Timestamp);
        const monthName = months[date.getMonth()];
        if (!monthlySales[monthName]) monthlySales[monthName] = 0;
        monthlySales[monthName] += order.FinalPrice;
    });

    // চার্টের জন্য ফরম্যাট করা (বর্তমান মাস এবং আগের ৫ মাস)
    const currentMonthIndex = new Date().getMonth();
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
        const mIndex = (currentMonthIndex - i + 12) % 12;
        const mName = months[mIndex];
        chartData.push({
            month: mName,
            sales: monthlySales[mName] || 0
        });
    }

    return NextResponse.json({
      success: true,
      stats: {
        revenue,
        totalOrders,
        totalCustomers,
        pendingOrders
      },
      chartData
    });

  } catch (error: any) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}