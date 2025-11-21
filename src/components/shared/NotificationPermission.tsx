// src/components/shared/NotificationPermission.tsx

'use client';

import { Button } from '@/components/ui/button';
import { usePushNotification } from '@/hooks/use-push-notification';
import { Bell, BellRing, Loader2 } from 'lucide-react';

export function NotificationPermission() {
  const { isSubscribed, isLoading, subscribeToPush } = usePushNotification();

  if (isSubscribed) {
    return (
      <Button variant="outline" disabled className="gap-2 text-green-600 border-green-200 bg-green-50">
        <BellRing className="h-4 w-4" />
        Notifications Active
      </Button>
    );
  }

  return (
    <Button 
        onClick={subscribeToPush} 
        disabled={isLoading}
        className="gap-2"
        variant="secondary"
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
      Enable Notifications
    </Button>
  );
}