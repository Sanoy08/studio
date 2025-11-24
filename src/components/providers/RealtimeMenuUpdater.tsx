// src/components/providers/RealtimeMenuUpdater.tsx

'use client';

import { useEffect } from 'react';
import Pusher from 'pusher-js';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function RealtimeMenuUpdater() {
  const router = useRouter();

  useEffect(() => {
    // পাবলিক কি দিয়ে কানেকশন (নিরাপদ)
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe('menu-updates');

    channel.bind('product-changed', (data: any) => {
      console.log('Realtime update received:', data);
      
      // ১. সার্ভার কম্পোনেন্ট রিফ্রেশ করা (নতুন ডেটা আনবে)
      router.refresh(); 

      // ২. ইউজারকে জানানো (অপশনাল)
      toast.info(data.message || 'Menu updated!', {
        duration: 3000,
        position: 'bottom-right',
        icon: '🔄'
      });
    });

    return () => {
      pusher.unsubscribe('menu-updates');
    };
  }, [router]);

  return null;
}