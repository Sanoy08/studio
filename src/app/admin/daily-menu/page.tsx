// src/app/admin/daily-menu/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Plus, Trash2, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { FloatingInput } from '@/components/ui/floating-input';

export default function DailyMenuPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [name, setName] = useState("Special Veg Thali");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [inStock, setInStock] = useState(true);
  const [notifyUsers, setNotifyUsers] = useState(false);
  
  // আইটেম লিস্ট ম্যানেজমেন্ট
  const [items, setItems] = useState<string[]>(["Rice", "Dal"]);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    const fetchData = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/admin/daily-special', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                const d = data.data;
                setName(d.name);
                setPrice(d.price);
                setImageUrl(d.imageUrl);
                setInStock(d.inStock);
                
                // ডেসক্রিপশন থেকে আইটেম লিস্ট বের করা
                if (d.description) {
                    const extractedItems = d.description.split('\n')
                        .map((line: string) => line.replace(/^•\s*/, '').trim())
                        .filter((line: string) => line.length > 0);
                    setItems(extractedItems);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, []);

  const handleAddItem = () => {
      if (newItem.trim()) {
          setItems([...items, newItem.trim()]);
          setNewItem("");
      }
  };

  const handleRemoveItem = (index: number) => {
      setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch('/api/admin/daily-special', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                price,
                items, // অ্যারে পাঠানো হচ্ছে
                imageUrl,
                inStock,
                notifyUsers
            })
        });

        const data = await res.json();
        if (res.ok) {
            toast.success("Daily menu updated!");
            setNotifyUsers(false); // রিসেট
        } else {
            toast.error(data.error || "Failed to update");
        }
    } catch (e) {
        toast.error("Error saving menu");
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
                <UtensilsCrossed className="h-6 w-6" />
            </div>
            <div>
                <h1 className="text-2xl font-bold font-headline">Daily Menu Manager</h1>
                <p className="text-sm text-muted-foreground">Update today's special Thali quickly.</p>
            </div>
        </div>

        <Card className="border-0 shadow-md">
            <CardContent className="p-6 space-y-6">
                
                {/* Image Upload */}
                <div className="space-y-2">
                    <Label>Menu Image</Label>
                    <ImageUpload 
                        value={imageUrl ? [imageUrl] : []}
                        onChange={(urls) => setImageUrl(urls[0] || '')}
                        maxFiles={1}
                        folder="dish"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FloatingInput label="Menu Name" value={name} onChange={(e) => setName(e.target.value)} />
                    <FloatingInput label="Price (₹)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>

                {/* Item List Manager */}
                <div className="space-y-3 bg-muted/30 p-4 rounded-xl border">
                    <Label>Menu Items (What's included?)</Label>
                    
                    <div className="flex gap-2">
                        <Input 
                            value={newItem} 
                            onChange={(e) => setNewItem(e.target.value)} 
                            placeholder="e.g. Basmati Rice" 
                            className="bg-background"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                        />
                        <Button onClick={handleAddItem} size="icon"><Plus className="h-4 w-4" /></Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1 bg-background border px-3 py-1 rounded-full text-sm shadow-sm animate-in zoom-in">
                                <span>{item}</span>
                                <button onClick={() => handleRemoveItem(idx)} className="text-muted-foreground hover:text-red-500 ml-1">
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                        {items.length === 0 && <p className="text-xs text-muted-foreground italic">No items added yet.</p>}
                    </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between border p-3 rounded-xl">
                        <div className="space-y-0.5">
                            <Label>In Stock</Label>
                            <p className="text-xs text-muted-foreground">Available for order</p>
                        </div>
                        <Switch checked={inStock} onCheckedChange={setInStock} />
                    </div>
                    
                    <div className="flex items-center justify-between border p-3 rounded-xl bg-primary/5 border-primary/20">
                        <div className="space-y-0.5">
                            <Label className="text-primary font-semibold">Notify Users</Label>
                            <p className="text-xs text-muted-foreground">Send push alert</p>
                        </div>
                        <Switch checked={notifyUsers} onCheckedChange={setNotifyUsers} />
                    </div>
                </div>

                <Button onClick={handleSave} className="w-full h-12 text-lg shadow-lg shadow-primary/20" disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                    Update & Publish
                </Button>

            </CardContent>
        </Card>
    </div>
  );
}