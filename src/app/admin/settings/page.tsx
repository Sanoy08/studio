'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const handleSave = () => {
    // এখানে আপনি সেটিং সেভ করার API কল করতে পারেন
    toast.success("Settings saved successfully!");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage store configurations and preferences.</p>
      </div>

      <div className="grid gap-6">
        {/* Store Configuration */}
        <Card>
            <CardHeader>
                <CardTitle>Store Configuration</CardTitle>
                <CardDescription>General settings for your store.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Delivery Charge (₹)</Label>
                        <Input type="number" defaultValue="40" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                        <Label>Free Delivery Above (₹)</Label>
                        <Input type="number" defaultValue="499" placeholder="499" />
                    </div>
                </div>
                <div className="flex items-center justify-between border p-3 rounded-lg">
                    <div className="space-y-0.5">
                        <Label>Accepting Orders</Label>
                        <p className="text-xs text-muted-foreground">Turn this off to temporarily close the store.</p>
                    </div>
                    <Switch defaultChecked />
                </div>
            </CardContent>
        </Card>

        {/* Wallet Settings */}
        <Card>
            <CardHeader>
                <CardTitle>Wallet & Coins</CardTitle>
                <CardDescription>Configure reward points system.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Coins per ₹100 Spent</Label>
                        <Input type="number" defaultValue="10" />
                    </div>
                    <div className="space-y-2">
                        <Label>1 Coin Value (₹)</Label>
                        <Input type="number" defaultValue="1" />
                    </div>
                </div>
            </CardContent>
        </Card>

        <div className="flex justify-end">
            <Button onClick={handleSave} size="lg">Save Changes</Button>
        </div>
      </div>
    </div>
  );
}