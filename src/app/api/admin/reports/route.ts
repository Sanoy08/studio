// src/app/api/admin/reports/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const DB_NAME = 'BumbasKitchenDB';
const ORDERS_COLLECTION = 'orders';
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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    if (!startDate || !endDate) {
        return NextResponse.json({ success: false, error: 'Date range required' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // ১. প্রতিদিনের সেলস রিপোর্ট
    const dailySales = await db.collection(ORDERS_COLLECTION).aggregate([
        {
            $match: {
                Timestamp: { $gte: start, $lte: end },
                Status: { $ne: 'Cancelled' }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$Timestamp" } },
                totalSales: { $sum: "$FinalPrice" },
                totalOrders: { $count: {} }
            }
        },
        { $sort: { _id: 1 } }
    ]).toArray();

    // ২. বিস্তারিত অর্ডার লিস্ট (CSV এর জন্য)
    const orders = await db.collection(ORDERS_COLLECTION).find({
        Timestamp: { $gte: start, $lte: end }
    }).sort({ Timestamp: -1 }).toArray();

    const formattedOrders = orders.map(order => ({
        id: order.OrderNumber,
        // ★★★ FIX: তারিখ ফরম্যাট DD/MM/YYYY করা হয়েছে (en-GB) ★★★
        date: new Date(order.Timestamp).toLocaleDateString('en-GB'),
        customer: order.Name,
        phone: order.Phone,
        items: order.Items?.map((i: any) => i.name).join(', ') || '',
        amount: order.FinalPrice,
        status: order.Status
    }));

    return NextResponse.json({ 
        success: true, 
        data: dailySales.map(d => ({ date: d._id, sales: d.totalSales, orders: d.totalOrders })),
        csvData: formattedOrders
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}