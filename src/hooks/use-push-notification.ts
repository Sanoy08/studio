// src/hooks/use-push-notification.ts

<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
=======
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
>>>>>>> parent of 83e2411 (app)

export function usePushNotification() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
<<<<<<< HEAD

  // রেজিস্টার করার মূল ফাংশন
  const registerPush = async () => {
    if (Capacitor.getPlatform() === 'web') return;
    
    setIsLoading(true);
    try {
        // ১. পারমিশন চেক
        let permStatus = await PushNotifications.checkPermissions();
        
        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
            alert("Please enable notifications from Settings.");
            setIsLoading(false);
            return;
        }

        // ২. প্লাগিন রেজিস্টার
        await PushNotifications.register();
        
        // ৩. লিসেনার যোগ করা (এটি নিশ্চিত করে যে টোকেন আসলে সেভ হবে)
        await addListeners();

    } catch (error) {
        alert("Setup Error: " + JSON.stringify(error));
        setIsLoading(false);
    }
  };

  const addListeners = async () => {
    // আগের লিসেনার রিমুভ করা ভালো, যাতে ডুপ্লিকেট না হয়
    await PushNotifications.removeAllListeners();

    PushNotifications.addListener('registration', async (token) => {
        // alert('Token Received: ' + token.value.substring(0,5)); // ডিবাগ
        const jwtToken = localStorage.getItem('token');
        if(jwtToken) {
            try {
                const response = await fetch('/api/notifications/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        token: token.value, 
                        type: 'fcm', 
                        jwtToken 
                    }),
                });
                if(response.ok) {
                    setIsSubscribed(true);
                    toast.success("Notifications Active!");
                }
            } catch(e) {
                console.error(e);
            }
        }
        setIsLoading(false);
    });

    PushNotifications.addListener('registrationError', (error: any) => {
        alert('Registration Failed: ' + JSON.stringify(error));
        setIsLoading(false);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
        toast.info(notification.title, { description: notification.body });
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        const link = action.notification.data.link;
        if (link) window.location.assign(link);
    });
  };

  useEffect(() => {
    // অ্যাপ ওপেন হলে একবার চেষ্টা করবে
    registerPush();
    return () => { PushNotifications.removeAllListeners(); };
  }, []);

  // ★ বাটনে ক্লিক করার জন্য এই ফাংশনটি রিটার্ন করা হলো
  return { 
      isSubscribed, 
      isLoading, 
      subscribeToPush: registerPush 
  };
=======
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
>>>>>>> parent of 83e2411 (app)
}