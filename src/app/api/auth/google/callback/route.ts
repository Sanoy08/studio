// src/app/api/auth/google/callback/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const DB_NAME = 'BumbasKitchenDB';
const COLLECTION_NAME = 'users';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
  const REDIRECT_URI = `${APP_URL}/api/auth/google/callback`;

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    // ১. কোড দিয়ে টোকেন আনা
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error_description);

    // ২. টোকেন দিয়ে ইউজারের তথ্য আনা
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userRes.json();

    // ৩. ডাটাবেসে চেক বা সেভ করা
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION_NAME);

    let user = await usersCollection.findOne({ email: googleUser.email.toLowerCase() });

    if (!user) {
      // নতুন ইউজার
      const newUser = {
        name: googleUser.name,
        email: googleUser.email.toLowerCase(),
        isVerified: true, // গুগল মানেই ভেরিফাইড
        createdAt: new Date(),
        role: "customer",
        picture: googleUser.picture,
        wallet: { currentBalance: 0, tier: "Bronze" }
      };
      const result = await usersCollection.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    } else {
      // পুরনো ইউজার - ছবি আপডেট করা যেতে পারে
      await usersCollection.updateOne({ _id: user._id }, { $set: { picture: googleUser.picture } });
      user.picture = googleUser.picture;
    }

    // ৪. আমাদের অ্যাপের টোকেন তৈরি করা
    const userPayload = {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        picture: user.picture
    };

    const appToken = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '30d' });

    // ৫. লগইন শেষে ফ্রন্টএন্ডে পাঠানো
    const redirectUrl = `${APP_URL}/google-callback?token=${encodeURIComponent(appToken)}&user=${encodeURIComponent(JSON.stringify(userPayload))}`;
    
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error("Google Login Error:", error);
    return NextResponse.redirect(`${APP_URL}/login?error=GoogleLoginFailed`);
  }
}