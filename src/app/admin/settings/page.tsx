// src/app/admin/settings/page.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings, Store, Wallet, Save, Bell, Download } from 'lucide-react';
import { toast } from 'sonner';
import { usePushNotification } from '@/hooks/use-push-notification'; // আমাদের তৈরি হুক

export default function AdminSettingsPage() {
  const { subscribeToPush, isSubscribed, isLoading } = usePushNotification();

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  }

  const handleEnableNotifications = async () => {
     await subscribeToPush();
     // হুক নিজেই টোস্ট দেখাবে
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" /> Settings
        </h1>
        <p className="text-muted-foreground mt-1">Configure your store preferences and notifications.</p>
      </div>

      <div className="grid gap-8">
        
        {/* Notification Settings */}
        <Card className="border-0 shadow-md">
            <CardHeader className="bg-muted/30 border-b">
                <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-500" />
                    <CardTitle>Admin Notifications</CardTitle>
                </div>
                <CardDescription>Receive alerts for new orders directly on this device.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Order Alerts</p>
                        <p className="text-sm text-muted-foreground">Get notified when a customer places an order.</p>
                    </div>
                    <Button 
                        onClick={handleEnableNotifications} 
                        disabled={isSubscribed || isLoading}
                        variant={isSubscribed ? "outline" : "default"}
                        className={isSubscribed ? "text-green-600 border-green-200 bg-green-50" : ""}
                    >
                        {isLoading ? "Enabling..." : isSubscribed ? "Notifications Active" : "Enable Notifications"}
                    </Button>
                </div>
            </CardContent>
        </Card>

        {/* Store Configuration */}
        <Card className="border-0 shadow-md">
            <CardHeader className="bg-muted/30 border-b">
                <div className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-primary" />
                    <CardTitle>Store Configuration</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Delivery Charge (₹)</Label>
                        <Input type="number" defaultValue="40" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                        <Label>Free Delivery Above (₹)</Label>
                        <Input type="number" defaultValue="499" placeholder="499" />
                    </div>
                </div>
                <div className="flex items-center justify-between border p-4 rounded-xl bg-green-50 border-green-100">
                    <div className="space-y-0.5">
                        <Label className="text-base font-semibold text-green-900">Accepting Orders</Label>
                        <p className="text-xs text-green-700">Turn this off to temporarily close the store.</p>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-green-600" />
                </div>
            </CardContent>
        </Card>

        {/* Wallet Settings */}
        <Card className="border-0 shadow-md">
            <CardHeader className="bg-muted/30 border-b">
                <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-amber-500" />
                    <CardTitle>Wallet & Reward Points</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Coins Earned per ₹100 Spent</Label>
                        <Input type="number" defaultValue="10" />
                    </div>
                    <div className="space-y-2">
                        <Label>1 Coin Value (₹)</Label>
                        <Input type="number" defaultValue="1" />
                    </div>
                </div>
            </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
            <Button onClick={handleSave} size="lg" className="gap-2 shadow-lg shadow-primary/20 px-8">
                <Save className="h-4 w-4" /> Save Changes
            </Button>
        </div>
      </div>
    </div>
  );
}