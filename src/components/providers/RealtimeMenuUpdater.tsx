// src/components/providers/RealtimeMenuUpdater.tsx

'use client';

import { useEffect } from 'react';
import Pusher from 'pusher-js';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function RealtimeMenuUpdater() {
  const router = useRouter();

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe('menu-updates');

    channel.bind('product-changed', (data: any) => {
      console.log('Realtime update received:', data);
      
      // ১. ইউজারকে নোটিফিকেশন দেখানো
      toast.info(data.message || 'Updating menu...', {
        duration: 3000,
        position: 'bottom-right',
        icon: '🔄'
      });

      // ২. Vercel-এর ক্যাশ আপডেট হওয়ার জন্য একটু সময় দেওয়া (Double Refresh Strategy)
      
      // প্রথম চেষ্টা: সাথে সাথে
      router.refresh();

      // দ্বিতীয় চেষ্টা: ১.৫ সেকেন্ড পর (Vercel-এর ক্যাশ আপডেট হওয়ার পর)
      setTimeout(() => {
        console.log('Triggering delayed refresh for Vercel consistency...');
        router.refresh();
      }, 1500);

    });

    return () => {
      pusher.unsubscribe('menu-updates');
    };
  }, [router]);

  return null;
}