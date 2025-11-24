// src/lib/pusher.ts

import Pusher from 'pusher';

// এটি শুধুমাত্র সার্ভার সাইডে রান হবে, তাই সিক্রেট এক্সপোজ হবে না
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});