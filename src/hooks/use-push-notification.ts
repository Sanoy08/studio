// src/hooks/use-push-notification.ts
import { useEffect } from 'react';
import { toast } from 'sonner';
import { isPlatform } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export function usePushNotification() {
  useEffect(() => {
    // Shudhu Android/iOS e kaj korbe
    if (!isPlatform('capacitor')) return;

    const registerPush = async () => {
        try {
            await PushNotifications.requestPermissions();
            await PushNotifications.register();

            PushNotifications.addListener('registration', async (token) => {
                const jwtToken = localStorage.getItem('token'); // Tomar auth token jeta login er por save hoy
                if(jwtToken) {
                    await fetch('/api/notifications/subscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            token: token.value, 
                            type: 'fcm', 
                            jwtToken 
                        }),
                    });
                }
            });

            PushNotifications.addListener('pushNotificationReceived', (notification) => {
                toast.info(notification.title, { description: notification.body });
            });

            PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
                const link = action.notification.data.link;
                if (link) window.location.assign(link);
            });

        } catch (error) {
            console.error("Push setup failed", error);
        }
    };
    
    registerPush();
  }, []);
  
  return {};
}