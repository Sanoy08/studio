// src/app/admin/notifications/page.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/admin/ImageUpload';

export default function AdminNotificationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    image: '',
    link: '',
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.message) {
        toast.error("Title and Message are required");
        return;
    }

    setIsLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success(data.message || 'Notifications sent successfully!');
        setFormData({ title: '', message: '', image: '', link: '' });
      } else {
        toast.error(data.error || 'Failed to send notifications');
      }
    } catch (e) {
      toast.error('Error sending notifications');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <div>
            <h1 className="text-3xl font-bold font-headline">Push Notifications</h1>
            <p className="text-muted-foreground">Send alerts to all subscribed devices.</p>
        </div>

      <Card>
        <CardHeader>
            <CardTitle>Compose Notification</CardTitle>
            <CardDescription>This will be sent to all users who allowed notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label>Title</Label>
                <Input 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    placeholder="e.g., 50% OFF on Biryani!"
                />
            </div>
            <div className="space-y-2">
                <Label>Message</Label>
                <Textarea 
                    value={formData.message} 
                    onChange={(e) => setFormData({...formData, message: e.target.value})} 
                    placeholder="Enter your message here..."
                />
            </div>
            
            {/* DRAG & DROP UPLOAD */}
            <div className="space-y-2">
                <Label>Notification Image (Optional)</Label>
                <ImageUpload 
                    value={formData.image ? [formData.image] : []}
                    onChange={(urls) => setFormData({...formData, image: urls[0] || ''})}
                    maxFiles={1}
                />
            </div>

            <div className="space-y-2">
                <Label>Link URL (Optional)</Label>
                <Input 
                    value={formData.link} 
                    onChange={(e) => setFormData({...formData, link: e.target.value})} 
                    placeholder="/menus"
                />
            </div>
            
            <Button className="w-full gap-2" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send Broadcast
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}