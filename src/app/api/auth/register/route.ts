// src/app/api/auth/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendNotificationToUser } from '@/lib/notification'; // নোটিফিকেশন ইউটিলিটি

const DB_NAME = 'BumbasKitchenDB';
const COLLECTION_NAME = 'users';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, password, name, phone } = await request.json();

    if (!email || !otp || !password || !name) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION_NAME);

    // ১. ইউজার রেকর্ড খোঁজা
    const userRecord = await usersCollection.findOne({ email: email.toLowerCase() });

    if (!userRecord) {
      return NextResponse.json({ success: false, error: 'User not found. Please request OTP first.' }, { status: 404 });
    }

    if (userRecord.isVerified) {
        return NextResponse.json({ success: false, error: 'User already verified. Please login.' }, { status: 400 });
    }

    // ২. OTP ভেরিফাই করা (টাইমিং এবং হ্যাশ চেক)
    if (!userRecord.otp || !userRecord.otpExpires) {
         return NextResponse.json({ success: false, error: 'Invalid OTP request.' }, { status: 400 });
    }

    if (new Date() > new Date(userRecord.otpExpires)) {
        return NextResponse.json({ success: false, error: 'OTP has expired.' }, { status: 400 });
    }

    const isOtpValid = await bcrypt.compare(otp, userRecord.otp);
    if (!isOtpValid) {
      return NextResponse.json({ success: false, error: 'Invalid OTP.' }, { status: 400 });
    }

    // ৩. পাসওয়ার্ড হ্যাশ করা এবং প্রোফাইল আপডেট করা
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await usersCollection.updateOne(
      { _id: userRecord._id },
      {
        $set: {
          name: name.trim(),
          phone: phone ? phone.trim() : "",
          password: hashedPassword,
          isVerified: true,
          role: 'customer', // ডিফল্ট রোল
          wallet: { currentBalance: 0, tier: "Bronze" } // ওয়ালেট শুরু
        },
        $unset: { otp: "", otpExpires: "" } // OTP মুছে ফেলা
      }
    );

    // ৪. ওয়েলকাম পুশ নোটিফিকেশন পাঠানো
    // (নোট: ইউজার যদি আগে থেকেই গেস্ট হিসেবে সাবস্ক্রাইব করে থাকে তবেই এটি যাবে)
    try {
        await sendNotificationToUser(
            client,
            userRecord._id.toString(),
            "Welcome to Bumba's Kitchen! 🎊",
            "Thanks for joining us. Order your first meal now and get exciting offers!",
            '/menus'
        );
    } catch (notifError) {
        console.error("Failed to send welcome notification:", notifError);
        // নোটিফিকেশন ফেইল করলেও রেজিস্ট্রেশন আটকাবে না
    }

    // ৫. লগইন টোকেন জেনারেট করা
    const token = jwt.sign(
        { 
            _id: userRecord._id.toString(), 
            email: userRecord.email, 
            name, 
            role: 'customer' 
        }, 
        JWT_SECRET, 
        { expiresIn: '30d' }
    );

    return NextResponse.json({
      success: true,
      message: 'Account verified and created successfully!',
      token,
      user: { 
          id: userRecord._id.toString(), 
          name, 
          email: userRecord.email, 
          role: 'customer', 
          phone: phone 
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}