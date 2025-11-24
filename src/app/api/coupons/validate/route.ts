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
    
    // কুপন খোঁজা (Case Insensitive)
    const coupon = await db.collection(COLLECTION_NAME).findOne({ 
        code: code.toUpperCase() 
    });

    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Invalid coupon code' }, { status: 404 });
    }

    // চেক: কুপন অ্যাক্টিভ কি না
    if (!coupon.isActive) {
      return NextResponse.json({ success: false, error: 'This coupon is inactive' }, { status: 400 });
    }

    // চেক: মেয়াদ শেষ হয়েছে কি না
    const now = new Date();
    const expiryDate = new Date(coupon.expiryDate);
    if (expiryDate < now) {
      return NextResponse.json({ success: false, error: 'This coupon has expired' }, { status: 400 });
    }

    // চেক: ব্যবহারের লিমিট শেষ কি না
    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      return NextResponse.json({ success: false, error: 'Coupon usage limit reached' }, { status: 400 });
    }

    // চেক: মিনিমাম অর্ডার অ্যামাউন্ট
    if (cartTotal < (coupon.minOrder || 0)) {
      return NextResponse.json({
        success: false,
        error: `Minimum order of ₹${coupon.minOrder} required`
      }, { status: 400 });
    }

    // ডিসকাউন্ট ক্যালকুলেশন
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.value) / 100;
    } else {
      discountAmount = coupon.value;
    }

    // ডিসকাউন্ট যেন মোট দামের বেশি না হয়
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