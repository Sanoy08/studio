// src/app/api/coupons/validate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';

const DB_NAME = 'BumbasKitchenDB';
const COLLECTION_NAME = 'coupons';

export async function POST(request: NextRequest) {
  try {
    const { code, cartTotal } = await request.json();

    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    const coupon = await db.collection(COLLECTION_NAME).findOne({ 
        code: code.toUpperCase() 
    });

    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Invalid coupon code' }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ success: false, error: 'This coupon is inactive' }, { status: 400 });
    }

    // ★ চেক: মেয়াদ শেষ কি না (যদি expiryDate থাকে)
    if (coupon.expiryDate) {
        const now = new Date();
        const expiryDate = new Date(coupon.expiryDate);
        // দিনের শেষ পর্যন্ত ভ্যালিড রাখার জন্য
        expiryDate.setHours(23, 59, 59, 999);
        
        if (expiryDate < now) {
            return NextResponse.json({ success: false, error: 'This coupon has expired' }, { status: 400 });
        }
    }
    // expiryDate না থাকলে (null) এটি আনলিমিটেড সময় চলবে

    // ★ চেক: ব্যবহারের লিমিট (যদি usageLimit > 0 হয়)
    if (coupon.usageLimit && coupon.usageLimit > 0) {
        if ((coupon.timesUsed || 0) >= coupon.usageLimit) {
            return NextResponse.json({ success: false, error: 'Coupon usage limit reached' }, { status: 400 });
        }
    }
    // usageLimit 0 হলে এটি আনলিমিটেড বার ব্যবহার করা যাবে

    if (cartTotal < (coupon.minOrder || 0)) {
      return NextResponse.json({
        success: false,
        error: `Minimum order of ₹${coupon.minOrder} required`
      }, { status: 400 });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.value) / 100;
    } else {
      discountAmount = coupon.value;
    }

    discountAmount = Math.min(discountAmount, cartTotal);

    return NextResponse.json({
      success: true,
      message: 'Coupon applied successfully!',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        value: coupon.value,
        discountAmount: discountAmount
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
