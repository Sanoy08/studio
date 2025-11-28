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
    return NextResponse.json({ error: 'Authorization code is missing.' }, { status: 400 });
  }

  try {
    // ১. কোড দিয়ে টোকেন এক্সচেঞ্জ করা
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
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

    const tokenData = await tokenResponse.json();
    if (tokenData.error) throw new Error(tokenData.error_description);

    // ২. ইউজার ইনফো নেওয়া
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userResponse.json();

    // ৩. ডেটাবেস অপারেশন
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION_NAME);

    let user = await usersCollection.findOne({ email: googleUser.email.toLowerCase() });

    if (!user) {
      // নতুন ইউজার তৈরি
      const newUser = {
        name: googleUser.name,
        email: googleUser.email.toLowerCase(),
        isVerified: true, // গুগল ভেরিফাইড তাই ট্রু
        createdAt: new Date(),
        wallet: { currentBalance: 0, tier: "Bronze" },
        role: "customer",
        picture: googleUser.picture
      };
      const result = await usersCollection.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    } else {
      // ছবি আপডেট করা (যদি পরিবর্তন হয়)
      await usersCollection.updateOne({ _id: user._id }, { $set: { picture: googleUser.picture } });
      user.picture = googleUser.picture;
    }

    // ৪. অ্যাপ টোকেন জেনারেট করা
    const userPayload = {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        picture: user.picture
    };

    const appToken = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '30d' });
    
    // ৫. ফ্রন্টএন্ডে রিডাইরেক্ট করা (টোকেন এবং ইউজার ডেটা সহ)
    // আমরা একটি স্পেশাল পেজে রিডাইরেক্ট করছি যা টোকেন রিসিভ করবে
    const redirectUrl = `${APP_URL}/google-callback?token=${encodeURIComponent(appToken)}&user=${encodeURIComponent(JSON.stringify(userPayload))}`;
    
    return NextResponse.redirect(redirectUrl);

  } catch (error: any) {
    console.error("Google Auth Error:", error);
    return NextResponse.redirect(`${APP_URL}/login?error=GoogleAuthFailed`);
  }
}