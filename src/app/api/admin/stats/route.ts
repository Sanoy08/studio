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

    // ১. সাধারণ পরিসংখ্যান
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
    const totalCustomers = await db.collection(USERS_COLLECTION).countDocuments({ role: 'customer' });
    
    // Pending Orders (Received or Processing)
    const pendingOrders = await db.collection(ORDERS_COLLECTION).countDocuments({ 
      Status: { $in: ['Received', 'Cooking', 'Processing'] } 
    });

    // ২. আজকের রেভিনিউ
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    
    const todayStats = await db.collection(ORDERS_COLLECTION).aggregate([
        { $match: { Timestamp: { $gte: startOfToday } } },
        { $group: { _id: null, todayRevenue: { $sum: "$FinalPrice" } } }
    ]).toArray();
    const todayRevenue = todayStats[0]?.todayRevenue || 0;

    // ৩. চার্টের ডেটা (Sales Trend)
    const allOrders = await db.collection(ORDERS_COLLECTION)
        .find({})
        .project({ Timestamp: 1, FinalPrice: 1, Items: 1 })
        .toArray();

    const monthlySales: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // ৪. টপ সেলিং আইটেম বের করা
    const itemSales: Record<string, number> = {};

    allOrders.forEach((order: any) => {
        // Monthly Sales Logic
        const date = new Date(order.Timestamp);
        const monthName = months[date.getMonth()];
        if (!monthlySales[monthName]) monthlySales[monthName] = 0;
        monthlySales[monthName] += order.FinalPrice;

        // Top Selling Logic
        if (Array.isArray(order.Items)) {
            order.Items.forEach((item: any) => {
                const name = item.name || item.Name;
                const qty = parseInt(item.quantity || item.Quantity || 0);
                if (name) {
                    itemSales[name] = (itemSales[name] || 0) + qty;
                }
            });
        }
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

    // টপ ৫ আইটেম
    const topSellingItems = Object.entries(itemSales)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }));

    return NextResponse.json({
      success: true,
      stats: {
        revenue,
        todayRevenue, // নতুন যোগ করা হয়েছে
        totalOrders,
        totalCustomers,
        pendingOrders
      },
      chartData,
      topSellingItems // নতুন যোগ করা হয়েছে
    });

  } catch (error: any) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}