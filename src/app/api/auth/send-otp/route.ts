// src/app/api/auth/send-otp/route.ts

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

    // ১. চেক করা ইউজার আগে থেকেই ভেরিফাইড কিনা
    const existingVerifiedUser = await usersCollection.findOne({ email: email.toLowerCase(), isVerified: true });
    if (existingVerifiedUser) {
      return NextResponse.json({ success: false, error: 'This email is already registered and verified.' }, { status: 409 });
    }

    // ২. OTP জেনারেট করা
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // ৩. ডাটাবেসে টেম্পোরারি সেভ করা
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

    // ৪. ইমেইল কনফিগারেশন
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SENDER_EMAIL_ADDRESS,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    // ★★★ প্রফেশনাল ইমেইল টেমপ্লেট ★★★
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
          .email-container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e0e0e0; }
          .header { background: linear-gradient(135deg, #4CAF50, #45a049); padding: 30px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 1px; }
          .content { padding: 40px 30px; color: #333333; line-height: 1.6; text-align: center; }
          .welcome-text { font-size: 20px; font-weight: 600; color: #2c3e50; margin-bottom: 15px; }
          .instruction { font-size: 15px; color: #666; margin-bottom: 25px; }
          .otp-box { background-color: #f0fdf4; border: 2px dashed #4CAF50; border-radius: 10px; padding: 15px 30px; display: inline-block; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: 800; color: #2e7d32; letter-spacing: 6px; font-family: 'Courier New', monospace; }
          .warning { font-size: 13px; color: #888; margin-top: 25px; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #eeeeee; }
          .footer p { margin: 5px 0; }
          .brand { color: #4CAF50; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>Bumba's Kitchen</h1>
          </div>
          <div class="content">
            <div class="welcome-text">Verify Your Email Address</div>
            <p class="instruction">Hi <strong>${name}</strong>,<br>Welcome to Bumba's Kitchen! Use the OTP below to complete your registration.</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            
            <p style="font-size: 14px; color: #555;">This code is valid for <strong>10 minutes</strong>.</p>
            <p class="warning">If you didn't request this, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} <span class="brand">Bumba's Kitchen</span>. All rights reserved.</p>
            <p>Janai, Garbagan, Hooghly, West Bengal</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Bumba's Kitchen" <${process.env.SENDER_EMAIL_ADDRESS}>`,
      to: email,
      subject: `Your Verification Code: ${otp}`,
      text: `Hello ${name}, Your OTP is ${otp}. It expires in 10 minutes.`,
      html: emailHtml 
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: `OTP sent to ${email}` }, { status: 200 });

  } catch (error: any) {
    console.error("Send OTP Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
