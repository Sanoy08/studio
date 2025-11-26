// src/app/api/auth/reset-password/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

const DB_NAME = 'BumbasKitchenDB';
const COLLECTION_NAME = 'users';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ success: false, error: 'Email, OTP, and new password are required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION_NAME);

    const user = await usersCollection.findOne({ 
        email: email.toLowerCase() 
    });

    if (!user || !user.resetOtp || !user.resetOtpExpires) {
        return NextResponse.json({ success: false, error: 'Invalid request or OTP expired.' }, { status: 400 });
    }

    // মেয়াদ চেক
    if (new Date() > new Date(user.resetOtpExpires)) {
        return NextResponse.json({ success: false, error: 'OTP has expired.' }, { status: 400 });
    }

    // OTP ম্যাচ করা
    const isOtpValid = await bcrypt.compare(otp, user.resetOtp);
    if (!isOtpValid) {
        return NextResponse.json({ success: false, error: 'Invalid OTP.' }, { status: 400 });
    }

    // নতুন পাসওয়ার্ড হ্যাশ করা
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // পাসওয়ার্ড আপডেট করা এবং OTP মুছে ফেলা
    await usersCollection.updateOne(
        { _id: user._id },
        { 
            $set: { password: hashedPassword },
            $unset: { resetOtp: "", resetOtpExpires: "" } 
        }
    );

    return NextResponse.json({ success: true, message: 'Password has been reset successfully.' });

  } catch (error: any) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ success: false, error: 'Something went wrong.' }, { status: 500 });
  }
}