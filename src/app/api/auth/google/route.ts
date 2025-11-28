// src/app/api/auth/google/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
  const REDIRECT_URI = `${APP_URL}/api/auth/google/callback`;

  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: 'Google Client ID missing' }, { status: 500 });
  }

  // গুগলের লগইন পেজের লিংক তৈরি
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile', // আমরা ইমেইল এবং নাম চাই
    access_type: 'offline',
    prompt: 'consent',
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}