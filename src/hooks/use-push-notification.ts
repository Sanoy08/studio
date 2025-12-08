// src/hooks/use-push-notification.ts

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export function usePushNotification() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // শুধুমাত্র অ্যাপে (Android) রান করবে
    if (Capacitor.getPlatform() === 'web') return;

    const registerPush = async () => {
        try {
            // ১. পারমিশন চাওয়া
            const permStatus = await PushNotifications.checkPermissions();
            
            if (permStatus.receive === 'prompt') {
               const newStatus = await PushNotifications.requestPermissions();
               if (newStatus.receive !== 'granted') {
                 alert("Notification Permission Denied!"); // ডিবাগ অ্যালার্ট
                 return;
               }
            } else if (permStatus.receive !== 'granted') {
               alert("Notifications are blocked in Settings!"); // ডিবাগ অ্যালার্ট
               return;
            }

            // ২. রেজিস্টার করা
            await PushNotifications.register();

            // ৩. লিসেনার সেট করা
            PushNotifications.addListener('registration', async (token) => {
                // টোকেন পেলে অ্যালার্ট দেখাবে (এটি সাকসেস মেসেজ)
                // alert('Success! Token: ' + token.value.substring(0, 10) + '...'); 
                
                const jwtToken = localStorage.getItem('token');
                if(jwtToken) {
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
                        toast.success("Notifications Connected!");
                    } else {
                        alert("API Error: Failed to save token");
                    }
                } else {
                    // লগইন করা না থাকলে
                    // alert("User not logged in, token not saved.");
                }
            });

            // ★★★ এই লিসেনারটি সবচেয়ে গুরুত্বপূর্ণ এখন ★★★
            PushNotifications.addListener('registrationError', (error: any) => {
                // যদি google-services.json ভুল থাকে, তবে এই অ্যালার্ট আসবে
                alert('Registration Error: ' + JSON.stringify(error));
            });

            PushNotifications.addListener('pushNotificationReceived', (notification) => {
                toast.info(notification.title, { description: notification.body });
            });

            PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
                const link = action.notification.data.link;
                if (link) window.location.assign(link);
            });

        } catch (error) {
            alert("Setup Error: " + JSON.stringify(error));
        }
    };
    
    registerPush();
    
    // ক্লিনআপ (অপশনাল)
    return () => {
        PushNotifications.removeAllListeners();
    };
  }, []);
  
  return { isSubscribed };
}