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
    // ১. অথেন্টিকেশন চেক
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
    const { firstName, lastName, dob, anniversary } = body;

    if (!firstName || !lastName) {
      return NextResponse.json({ success: false, error: 'First and Last name are required.' }, { status: 400 });
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION_NAME);

    // ২. বর্তমান ইউজার ডেটা আনা (চেক করার জন্য)
    const currentUser = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!currentUser) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // ৩. আপডেট অবজেক্ট তৈরি
    const updateDoc: any = {
        name: fullName,
    };

    // Birthday Check
    if (!currentUser.dob && dob) {
        updateDoc.dob = dob;
    } else if (currentUser.dob && dob && currentUser.dob !== dob) {
        console.warn(`User ${userId} tried to change DOB from ${currentUser.dob} to ${dob}`);
    }

    // Anniversary Check
    if (!currentUser.anniversary && anniversary) {
        updateDoc.anniversary = anniversary;
    } else if (currentUser.anniversary && anniversary && currentUser.anniversary !== anniversary) {
        console.warn(`User ${userId} tried to change Anniversary from ${currentUser.anniversary} to ${anniversary}`);
    }

    // ৪. ডাটাবেস আপডেট
    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    // ★★★ FIX: result null কি না চেক করা হচ্ছে ★★★
    // এই চেকটি না থাকলে TypeScript এরর দেয় কারণ result null হতে পারে
    if (!result) {
        return NextResponse.json({ success: false, error: 'Failed to update profile.' }, { status: 500 });
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
        dob: updatedUser.dob,
        anniversary: updatedUser.anniversary
      }
    });

  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}