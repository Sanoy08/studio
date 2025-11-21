import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

const DB_NAME = 'BumbasKitchenDB';
const COLLECTION_NAME = 'users';
const OTP_EXPIRY_MINUTES = 10;

export async function POST(request: NextRequest) {
  try {
    const { email, name, phone } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'A valid email is required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION_NAME);

    const existingVerifiedUser = await usersCollection.findOne({ email: email.toLowerCase(), isVerified: true });
    if (existingVerifiedUser) {
      return NextResponse.json({ success: false, error: 'This email is already registered and verified.' }, { status: 409 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const temporaryUserData = {
      name: name || "",
      email: email.toLowerCase(),
      phone: phone || "",
      otp: otpHash,
      otpExpires,
      isVerified: false
    };

    await usersCollection.updateOne(
      { email: email.toLowerCase() },
      { $set: temporaryUserData, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    // Email sending logic
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SENDER_EMAIL_ADDRESS,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    const mailOptions = {
      from: `"Bumba's Kitchen" <${process.env.SENDER_EMAIL_ADDRESS}>`,
      to: email,
      subject: `Your Verification Code: ${otp}`,
      text: `Hello ${name}, Your OTP is ${otp}. It expires in 10 minutes.`,
      html: `<p>Hello ${name},</p><p>Your OTP is <strong>${otp}</strong>.</p>` // Add your full HTML template here
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: `OTP sent to ${email}` }, { status: 200 });

  } catch (error: any) {
    console.error("Send OTP Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}