// src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const DB_NAME = 'BumbasKitchenDB';
const COLLECTION_NAME = 'users';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_change_me'; // .env.local এ সেট করতে ভুলবেন না

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION_NAME);

    // Find user by email (case-insensitive handle korar jonne lowercase kora holo)
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    // Check if user exists and is verified
    if (!user || !user.isVerified) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials or account not verified.' },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Generate JWT Token
    const token = jwt.sign(
      { 
        _id: user._id.toString(), 
        email: user.email, 
        name: user.name, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again later.' },
      { status: 500 }
    );
  }
}