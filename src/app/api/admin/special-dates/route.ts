// src/app/api/admin/special-dates/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const DB_NAME = 'BumbasKitchenDB';
const USERS_COLLECTION = 'users';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

async function isAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  try {
    const decoded: any = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    return decoded.role === 'admin';
  } catch { return false; }
}

export async function GET(request: NextRequest) {
  try {
    if (!await isAdmin(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // যাদের dob বা anniversary সেট করা আছে তাদের খুঁজে বের করা
    const users = await db.collection(USERS_COLLECTION).find({
        $or: [
            { dob: { $exists: true, $ne: "" } },
            { anniversary: { $exists: true, $ne: "" } }
        ]
    }).project({ name: 1, dob: 1, anniversary: 1, email: 1 }).toArray();

    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      dob: user.dob,
      anniversary: user.anniversary
    }));

    return NextResponse.json(formattedUsers, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}