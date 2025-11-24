// src/app/api/auth/update-profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const DB_NAME = 'BumbasKitchenDB';
const COLLECTION_NAME = 'users';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let userId;
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      userId = decoded._id;
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid Token' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, dob, anniversary } = body; // নতুন ফিল্ড

    if (!firstName || !lastName) {
      return NextResponse.json({ success: false, error: 'First and Last name are required.' }, { status: 400 });
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION_NAME);

    // আপডেট কুয়েরি তৈরি
    const updateDoc: any = {
        name: fullName,
        dob: dob || null,             // জন্মদিন সেভ হবে
        anniversary: anniversary || null // অ্যানিভার্সারি সেভ হবে
    };

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const updatedUser = result;
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address,
        picture: updatedUser.picture,
        dob: updatedUser.dob,             // রিটার্ন করা হচ্ছে
        anniversary: updatedUser.anniversary // রিটার্ন করা হচ্ছে
      }
    });

  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}