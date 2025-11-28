// src/app/(shop)/notifications/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Loader2, Clock, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';

type Notification = {
  _id: string;
  title: string;
  message: string;
  image?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !user) {
        router.push('/login');
        return;
    }

    const fetchNotifications = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch('/api/notifications/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (data.success) {
                setNotifications(data.notifications);
            } else {
                toast.error("Failed to load notifications");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (user) {
        fetchNotifications();
    }
  }, [user, isAuthLoading, router]);

  // টাইম ফরম্যাট ফাংশন (e.g., "2 hours ago")
  const formatTimeAgo = (dateString: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
  };

  if (isAuthLoading || isLoading) {
      return <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container max-w-2xl py-8 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> Your Notifications
        </h1>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
            <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-lg">You have no notifications yet.</p>
                <Button asChild variant="link" className="mt-2">
                    <Link href="/menus">Browse Menu</Link>
                </Button>
            </div>
        ) : (
            notifications.map((notification) => (
                <Card 
                    key={notification._id} 
                    className={`overflow-hidden border transition-all hover:shadow-md ${!notification.isRead ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}
                >
                    <div className="p-4 flex gap-4">
                        {/* আইকন বা ছবি */}
                        <div className="shrink-0">
                            {notification.image ? (
                                <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted">
                                    <Image src={notification.image} alt="Notification" fill className="object-cover" unoptimized={true} />
                                </div>
                            ) : (
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${!notification.isRead ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                    <Bell className="h-6 w-6" />
                                </div>
                            )}
                        </div>

                        {/* কন্টেন্ট */}
                        <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start gap-2">
                                <h3 className={`text-sm font-semibold ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {notification.title}
                                </h3>
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1 shrink-0">
                                    <Clock className="h-3 w-3" /> {formatTimeAgo(notification.createdAt)}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                {notification.message}
                            </p>
                            
                            {/* অ্যাকশন লিংক (যদি থাকে) */}
                            {notification.link && (
                                <div className="mt-3">
                                    <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1">
                                        <Link href={notification.link}>
                                            Visit Link <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                        
                        {/* আনরিড ডট */}
                        {!notification.isRead && (
                            <div className="shrink-0 pt-1">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            </div>
                        )}
                    </div>
                </Card>
            ))
        )}
      </div>
    </div>
  );
}