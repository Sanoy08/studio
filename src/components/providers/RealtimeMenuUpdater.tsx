// src/components/providers/RealtimeMenuUpdater.tsx

'use client';

import { useEffect } from 'react';
import Pusher from 'pusher-js';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function RealtimeMenuUpdater() {
  const router = useRouter();

  useEffect(() => {
    // কানেকশন সেটআপ
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe('menu-updates');

    channel.bind('product-changed', (data: any) => {
      console.log('Realtime update received:', data);
      
      // ১. ইউজারকে নোটিফিকেশন দেখানো
      toast.info(data.message || 'Menu updating...', {
        duration: 3000,
        position: 'bottom-right',
        icon: '🔄'
      });

      // ২. Vercel-এর ক্যাশ আপডেট হওয়ার জন্য Retry Strategy (একাধিকবার রিফ্রেশ)
      
      // প্রথম চেষ্টা: সাথে সাথে
      router.refresh();

      // দ্বিতীয় চেষ্টা: ১ সেকেন্ড পর (Vercel-এর ক্যাশ আপডেট হওয়ার কথা)
      setTimeout(() => {
        console.log('Triggering delayed refresh (1s)...');
        router.refresh();
      }, 1000);

      // তৃতীয় চেষ্টা: ৩ সেকেন্ড পর (যদি আগেরটা মিস হয়)
      setTimeout(() => {
          console.log('Triggering delayed refresh (3s)...');
          router.refresh();
      }, 3000);
      
      // চতুর্থ চেষ্টা: ৫ সেকেন্ড পর (ফাইনাল চেক)
      setTimeout(() => {
          console.log('Triggering delayed refresh (5s)...');
          router.refresh();
      }, 5000);

    });

    return () => {
      pusher.unsubscribe('menu-updates');
    };
  }, [router]);

  return null;
}