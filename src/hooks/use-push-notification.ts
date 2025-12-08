// src/hooks/use-push-notification.ts

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export function usePushNotification() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
}