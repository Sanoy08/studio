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
      return NextResponse.json({ success: false, error: 'Name is required.' }, { status: 400 });
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION_NAME);

    // ২. বর্তমান ইউজার ডেটা আনা
    const currentUser = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!currentUser) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // ৩. আপডেট লজিক (কঠোরভাবে চেক করা হচ্ছে)
    const updateFields: any = {
        name: fullName,
    };

    // লজিক: যদি ডাটাবেসে dob না থাকে (বা ফাঁকা থাকে), তবেই নতুন dob সেট হবে
    const hasExistingDob = currentUser.dob && currentUser.dob.trim() !== "";
    if (!hasExistingDob && dob) {
        updateFields.dob = dob;
    }

    // লজিক: যদি ডাটাবেসে anniversary না থাকে, তবেই সেট হবে
    const hasExistingAnniv = currentUser.anniversary && currentUser.anniversary.trim() !== "";
    if (!hasExistingAnniv && anniversary) {
        updateFields.anniversary = anniversary;
    }

    // ৪. ডাটাবেস আপডেট করা
    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) {
        return NextResponse.json({ success: false, error: 'Update failed.' }, { status: 500 });
    }

    // ৫. আপডেটেড ডেটা রিটার্ন করা (যাতে ফ্রন্টএন্ড সিঙ্ক হতে পারে)
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