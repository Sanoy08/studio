import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { clientPromise } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const DB_NAME = 'BumbasKitchenDB';
const COLLECTION_NAME = 'users';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

  if (!code) {
    return NextResponse.json({ error: 'Authorization code is missing.' }, { status: 400 });
  }

  try {
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${APP_URL}/api/auth/google/callback`
    );

    // ১. কোড দিয়ে টোকেন এবং ইউজার ইনফো নেওয়া
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const userInfoRes = await client.request({ url: 'https://www.googleapis.com/oauth2/v3/userinfo' });
    const googleUser: any = userInfoRes.data;

    // ২. ডেটাবেস কানেকশন
    const mongoClient = await clientPromise;
    const db = mongoClient.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION_NAME);

    // ৩. ইউজার চেক বা তৈরি করা
    let user = await usersCollection.findOne({ email: googleUser.email.toLowerCase() });

    if (!user) {
      // নতুন ইউজার
      const newUser = {
        name: googleUser.name,
        email: googleUser.email.toLowerCase(),
        isVerified: true, // গুগল ভেরিফাইড
        authProvider: 'google',
        createdAt: new Date(),
        wallet: { currentBalance: 0, tier: "Bronze" },
        role: "customer",
        picture: googleUser.picture
      };
      const result = await usersCollection.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    } else {
      // পুরনো ইউজার - ছবি আপডেট করা
      await usersCollection.updateOne(
          { _id: user._id }, 
          { $set: { picture: googleUser.picture } }
      );
      user.picture = googleUser.picture;
    }

    // ৪. আমাদের অ্যাপের জন্য JWT টোকেন তৈরি
    const userPayload = {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        picture: user.picture
    };

    const appToken = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '30d' });
    
    // ৫. টোকেন সহ ফ্রন্টএন্ডে রিডাইরেক্ট
    // আমরা টোকেন এবং ইউজার ডেটা URL প্যারামিটারে পাঠিয়ে দিচ্ছি
    const redirectUrl = `${APP_URL}/google-callback?token=${encodeURIComponent(appToken)}&user=${encodeURIComponent(JSON.stringify(userPayload))}`;
    
    return NextResponse.redirect(redirectUrl);

  } catch (error: any) {
    console.error("Google Auth Error:", error);
    return NextResponse.redirect(`${APP_URL}/login?error=GoogleAuthFailed`);
  }
}