// src/app/api/orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { sendNotificationToAdmins, sendNotificationToUser } from '@/lib/notification';

const DB_NAME = 'BumbasKitchenDB';
const ORDERS_COLLECTION = 'orders';
const COUPONS_COLLECTION = 'coupons';
const USERS_COLLECTION = 'users';
const TRANSACTIONS_COLLECTION = 'coinTransactions';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    let userIdToSave: ObjectId | null = null;
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userIdToSave = new ObjectId(decoded._id);
      } catch (e) { console.warn("Invalid token"); }
    }

    const orderNumber = `BK-${Date.now().toString().slice(-5)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    const newOrder = {
      OrderNumber: orderNumber,
      userId: userIdToSave,
      Timestamp: new Date(),
      Name: orderData.name,
      Phone: orderData.altPhone,
      Address: orderData.address,
      DeliveryAddress: orderData.deliveryAddress || orderData.address,
      OrderType: orderData.orderType || 'Delivery',
      MealTime: orderData.mealTime,
      PreferredDate: new Date(orderData.preferredDate),
      Instructions: orderData.instructions,
      Subtotal: parseFloat(orderData.subtotal),
      Discount: parseFloat(orderData.discount || 0),
      CouponCode: orderData.couponCode || null,
      FinalPrice: parseFloat(orderData.total),
      Items: orderData.items, 
      Status: "Received"
    };

    const result = await db.collection(ORDERS_COLLECTION).insertOne(newOrder);

    if (result.acknowledged) {
      
      // কুপন আপডেট
      if (orderData.couponCode) {
         await db.collection(COUPONS_COLLECTION).updateOne({ code: orderData.couponCode.toUpperCase() }, { $inc: { timesUsed: 1 } });
      }

      // কয়েন লজিক
      if (userIdToSave) {
          const coinsEarned = Math.floor(newOrder.FinalPrice / 100) * 10; 
          if (coinsEarned > 0) {
              await db.collection(USERS_COLLECTION).updateOne({ _id: userIdToSave }, { $inc: { "wallet.currentBalance": coinsEarned } });
              await db.collection(TRANSACTIONS_COLLECTION).insertOne({ userId: userIdToSave, type: 'earn', amount: coinsEarned, description: `Earned from Order #${orderNumber}`, createdAt: new Date() });

              // Coin Notification
              await sendNotificationToUser(client, userIdToSave.toString(), "🎉 Coins Earned!", `You earned ${coinsEarned} coins from your recent order.`, '/account/wallet');
          }

          // ★★★ 1. Order Confirmation Notification (User) ★★★
          await sendNotificationToUser(
              client,
              userIdToSave.toString(),
              "Order Placed! 🥘",
              `We have received your order #${orderNumber}. The kitchen will start preparing it soon!`,
              '/account/orders'
          );
      }

      // Admin Notification
      await sendNotificationToAdmins(client, "New Order Received! 🛍️", `Order #${orderNumber} from ${orderData.name} - ₹${newOrder.FinalPrice}`, '/admin/orders');

      return NextResponse.json({ success: true, message: "Order placed successfully!", orderId: orderNumber }, { status: 201 });
    } else {
      throw new Error('Failed to insert order.');
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}