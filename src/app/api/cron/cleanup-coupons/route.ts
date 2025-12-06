// src/app/api/cron/cleanup-coupons/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';

// ক্যাশিং বন্ধ (সবসময় ফ্রেশ চেক করার জন্য)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // ১. সিকিউরিটি চেক
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const queryKey = searchParams.get('key');
    const CRON_SECRET = process.env.CRON_SECRET;

    if (authHeader !== `Bearer ${CRON_SECRET}` && queryKey !== CRON_SECRET) {
        return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('BumbasKitchenDB');
    const couponsCollection = db.collection('coupons');

    const now = new Date();

    // ২. ডিলিট করার শর্তসমূহ
    const result = await couponsCollection.deleteMany({
        $or: [
            // শর্ত ১: মেয়াদ শেষ (Expiry Date পার হয়ে গেছে)
            { expiryDate: { $lt: now.toISOString().split('T')[0] } }, 
            
            // শর্ত ২: ইনঅ্যাক্টিভ (Inactive)
            { isActive: false },

            // শর্ত ৩: ব্যবহারের লিমিট শেষ (Usage Limit Reached)
            // (যাদের usageLimit আছে এবং timesUsed তার সমান বা বেশি)
            {
                $and: [
                    { usageLimit: { $exists: true, $ne: null, $gt: 0 } },
                    { $expr: { $gte: ["$timesUsed", "$usageLimit"] } }
                ]
            }
        ]
    });

    return NextResponse.json({ 
        success: true, 
        message: `Cleanup successful. Deleted ${result.deletedCount} coupons.` 
    });

  } catch (error: any) {
    console.error("Coupon Cleanup Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}