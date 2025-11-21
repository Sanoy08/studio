// src/hooks/use-push-notification.ts

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
 
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
 
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotification() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      // সার্ভিস ওয়ার্কার রেজিস্টার করা
      navigator.serviceWorker.register('/sw.js').then(registration => {
        registration.pushManager.getSubscription().then(sub => {
          if (sub) {
            setSubscription(sub);
            setIsSubscribed(true);
          }
        });
      });
    }
  }, []);

  const subscribeToPush = async () => {
    setIsLoading(true);
    try {
      // ১. পাবলিক VAPID কি আনা
      const response = await fetch('/api/notifications/vapid-key');
      const { publicKey } = await response.json();

      const registration = await navigator.serviceWorker.ready;
      
      // ২. ব্রাউজারে সাবস্ক্রাইব করা
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      // ৩. সার্ভারে সাবস্ক্রিপশন পাঠানো
      const token = localStorage.getItem('token');
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            subscription: sub,
            token: token // লগইন করা থাকলে ইউজার আইডি সেভ হবে
        }),
      });

      setSubscription(sub);
      setIsSubscribed(true);
      toast.success("Notifications enabled!");

    } catch (error) {
      console.error("Subscription failed:", error);
      toast.error("Failed to enable notifications.");
    } finally {
      setIsLoading(false);
    }
  };

  return { isSubscribed, isLoading, subscribeToPush };
}