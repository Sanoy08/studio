import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Bell, ShoppingCart, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const notifications = [
  {
    id: 1,
    icon: <Tag className="h-6 w-6 text-primary" />,
    title: 'Weekend Special is live!',
    description: 'Check out our delicious weekend thali. Available now!',
    time: '2 hours ago',
  },
  {
    id: 2,
    icon: <ShoppingCart className="h-6 w-6 text-green-500" />,
    title: 'Order Delivered',
    description: 'Your order #ORD003 has been successfully delivered.',
    time: '1 day ago',
  },
  {
    id: 3,
    icon: <Bell className="h-6 w-6 text-blue-500" />,
    title: 'New Item on Menu',
    description: 'Try our new Chicken Kosha. You will love it!',
    time: '3 days ago',
  },
  {
    id: 4,
    icon: <Tag className="h-6 w-6 text-primary" />,
    title: '20% Off on all Biryanis',
    description: 'Limited time offer. Order now to avail the discount.',
    time: '5 days ago',
  },
];

export default function NotificationsPage() {
  return (
    <div className="container py-12">
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8 text-center">
        Notifications
      </h1>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Recent Updates</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div className="flex items-start gap-4 p-4">
                    <div className="flex-shrink-0">{notification.icon}</div>
                    <div className="flex-grow">
                      <p className="font-semibold">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {notification.description}
                      </p>
                       <p className="text-xs text-muted-foreground mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-16">
                <Bell className="mx-auto h-24 w-24 text-muted-foreground" />
                <h2 className="mt-6 text-2xl font-bold">No new notifications</h2>
                <p className="mt-2 text-muted-foreground">
                  You're all caught up! We'll let you know when there's something new.
                </p>
            </div>
          )}
           {notifications.length > 0 && (
             <div className="mt-6 text-center">
                 <Button variant="outline">Mark all as read</Button>
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
