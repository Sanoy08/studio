'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings, Store, Wallet, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const handleSave = () => {
    // Future: Implement API call to save settings to DB
    toast.success("Settings saved locally (Demo)!");
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" /> Settings
        </h1>
        <p className="text-muted-foreground mt-1">Configure your store preferences and system defaults.</p>
      </div>

      <div className="grid gap-8">
        {/* Store Configuration */}
        <Card className="border-0 shadow-md">
            <CardHeader className="bg-muted/30 border-b">
                <div className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-primary" />
                    <CardTitle>Store Configuration</CardTitle>
                </div>
                <CardDescription>Manage delivery charges and store availability.</CardDescription>
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
                <CardDescription>Configure customer loyalty rewards.</CardDescription>
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