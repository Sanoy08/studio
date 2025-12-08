// src/app/api/admin/notifications/send/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { sendNotificationToAllUsers } from '@/lib/notification'; // web-push এর বদলে এটি ইমপোর্ট করুন

export async function POST(request: NextRequest) {
  try {
    const { title, message, link } = await request.json(); // message field টি আপনার ফ্রন্টএন্ড থেকে আসছে

    if (!title || !message) {
        return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const client = await clientPromise;
    
    // নতুন ব্রডকাস্ট ফাংশন কল করা হচ্ছে
    await sendNotificationToAllUsers(client, title, message, link || '/');

    return NextResponse.json({ success: true, message: 'Notification sent successfully' });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}