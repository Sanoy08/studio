// src/app/api/auth/forgot-password/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

const DB_NAME = 'BumbasKitchenDB';
const COLLECTION_NAME = 'users';
const OTP_EXPIRY_MINUTES = 15;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION_NAME);
    
    // ভেরিফাইড ইউজার চেক করা
    const user = await usersCollection.findOne({ 
        email: email.toLowerCase(), 
        isVerified: true 
    });

    if (!user) {
      // নিরাপত্তার জন্য আমরা বলব না যে ইউজার নেই, কিন্তু ইমেইলও পাঠাব না
      return NextResponse.json({ success: false, error: 'No verified account found with that email.' }, { status: 404 });
    }

    // OTP জেনারেট করা
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // ডাটাবেসে OTP সেভ করা
    await usersCollection.updateOne(
        { _id: user._id },
        { $set: { resetOtp: otpHash, resetOtpExpires: otpExpires } }
    );

    const currentYear = new Date().getFullYear();

    // OTP ইমেইল টেমপ্লেট
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
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #eeeeee; }
          .brand { color: #4CAF50; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>Bumba's Kitchen</h1>
          </div>
          <div class="content">
            <div class="welcome-text">Reset Password OTP</div>
            <p class="instruction">Hi <strong>${user.name}</strong>,<br>Use the OTP below to reset your password. Do not share this code with anyone.</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            
            <p style="font-size: 14px; color: #555;">This code is valid for <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.</p>
          </div>
          <div class="footer">
            <p>&copy; ${currentYear} <span class="brand">Bumba's Kitchen</span>. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SENDER_EMAIL_ADDRESS,
            pass: process.env.EMAIL_APP_PASSWORD
        }
    });

    await transporter.sendMail({
        from: `"Bumba's Kitchen" <${process.env.SENDER_EMAIL_ADDRESS}>`,
        to: email, // ঠিক এই ইমেইলেই যাবে
        subject: 'Password Reset OTP - Bumba\'s Kitchen',
        html: emailHtml,
    });

    return NextResponse.json({ success: true, message: 'OTP sent to your email.' });

  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ success: false, error: 'Something went wrong.' }, { status: 500 });
  }
}