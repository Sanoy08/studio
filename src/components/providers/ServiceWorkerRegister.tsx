// src/components/providers/ServiceWorkerRegister.tsx

'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // পেজ লোড হওয়ার পর রেজিস্ট্রেশন করা (যাতে ইনিশিয়াল লোড স্লো না হয়)
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return null; // এটি কোনো UI রেন্ডার করবে না
}