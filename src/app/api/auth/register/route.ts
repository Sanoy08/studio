import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const DB_NAME = 'BumbasKitchenDB';
const COLLECTION_NAME = 'users';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, password, name, phone } = await request.json();

    if (!email || !otp || !password || !name) {
      return NextResponse.json({ success: false, error: 'Missing fields.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION_NAME);

    const userRecord = await usersCollection.findOne({ email: email.toLowerCase() });

    if (!userRecord || userRecord.isVerified) {
      return NextResponse.json({ success: false, error: 'Invalid request or already verified.' }, { status: 400 });
    }

    // Verify OTP
    const isOtpValid = await bcrypt.compare(otp, userRecord.otp);
    if (!isOtpValid) {
      return NextResponse.json({ success: false, error: 'Invalid OTP.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await usersCollection.updateOne(
      { _id: userRecord._id },
      {
        $set: {
          name: name.trim(),
          phone: phone ? phone.trim() : "",
          password: hashedPassword,
          isVerified: true,
          role: 'customer',
          wallet: { currentBalance: 0, tier: "Bronze" }
        },
        $unset: { otp: "", otpExpires: "" }
      }
    );

    // Generate Token
    const token = jwt.sign(
      { _id: userRecord._id.toString(), email: userRecord.email, name, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return NextResponse.json({
      success: true,
      message: 'Account verified!',
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