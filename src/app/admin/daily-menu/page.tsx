// src/app/admin/daily-menu/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Plus, Trash2, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';
import { FloatingInput } from '@/components/ui/floating-input';

export default function DailyMenuPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [name, setName] = useState("Special Veg Thali");
  const [price, setPrice] = useState("");
  const [inStock, setInStock] = useState(true);
  const [notifyUsers, setNotifyUsers] = useState(false);
  
  const [items, setItems] = useState<string[]>(["Rice", "Dal"]);
  const [newItem, setNewItem] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);

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
                setInStock(d.inStock);
                
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

  // ★★★ মেইন ফাংশন: জেনারেট, আপলোড এবং সেভ একসাথে ★★★
  const handleSave = async () => {
    if (!canvasRef.current) return;
    if (!price) {
        toast.error("Please enter a price to generate the poster.");
        return;
    }

    setIsSaving(true);
    const token = localStorage.getItem('token');

    try {
        // ১. ইমেজ জেনারেট করা (ক্যানভাস লজিক)
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Canvas context not found");

        // ক্যানভাস সাইজ সেটআপ (১৫০০x১৫০০)
        const SCALE_FACTOR = 3;
        canvas.width = 500 * SCALE_FACTOR;
        canvas.height = 500 * SCALE_FACTOR;
        ctx.scale(SCALE_FACTOR, SCALE_FACTOR);

        // ব্যাকগ্রাউন্ড লোড
        const bgImage = new Image();
        bgImage.src = '/daily.jpg'; 
        bgImage.crossOrigin = "anonymous";

        await new Promise((resolve, reject) => {
            bgImage.onload = resolve;
            bgImage.onerror = reject;
        });

        ctx.drawImage(bgImage, 0, 0, 500, 500);

        // টেক্সট রেন্ডারিং (আপনার দেওয়া পজিশন অনুযায়ী)
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // --- তারিখ ---
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = String(today.getFullYear()).slice(-2);
        const dateText = `${day}/${month}/${year}`;

        ctx.save();
        ctx.translate(330, 123); 
        ctx.rotate(-4.39 * Math.PI / 180); 
        ctx.fillStyle = "#00355b"; 
        ctx.font = "900 15px 'Montserrat', sans-serif"; 
        ctx.fillText(dateText, 0, 0);
        ctx.restore();

        // --- মেনু আইটেম ---
        ctx.save();
        ctx.translate(250, 320); 
        ctx.fillStyle = "#ffffffff"; 
        ctx.font = "500 24px 'Anek Bangla', sans-serif"; 

        const lineHeight = 30;
        const totalHeight = items.length * lineHeight;
        let currentY = -(totalHeight / 2) + (lineHeight / 2);

        const displayItems = items.slice(0, 6);

        displayItems.forEach(item => {
            ctx.fillText(item, 0, currentY); 
            currentY += lineHeight;
        });
        ctx.restore();

        // --- দাম ---
        ctx.save();
        ctx.translate(79, 231);
        ctx.fillStyle = "#000000ff"; 
        ctx.font = "italic bold 32px sans-serif"; 
        ctx.fillText(`₹${price}`, 0, 0);
        ctx.restore();

        // ২. ইমেজ ফাইলে রূপান্তর এবং আপলোড
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', 0.9));
        if (!blob) throw new Error("Canvas conversion failed");

        const formData = new FormData();
        formData.append('file', blob);
        
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME_DISHES || "dk1acdtja";
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_DISHES || "bumbas-kitchen-dishes";
        formData.append('upload_preset', uploadPreset);

        // আপলোড হচ্ছে...
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadData.secure_url) throw new Error("Image upload failed");

        const finalImageUrl = uploadData.secure_url;

        // ৩. ডাটাবেসে সেভ করা
        const res = await fetch('/api/admin/daily-special', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                price,
                items, 
                imageUrl: finalImageUrl, // জেনারেট করা ইমেজের লিংক
                inStock,
                notifyUsers
            })
        });

        const data = await res.json();
        if (res.ok) {
            toast.success("Poster Generated & Menu Updated! 🚀");
            setNotifyUsers(false); 
        } else {
            toast.error(data.error || "Failed to update menu");
        }

    } catch (e) {
        console.error(e);
        toast.error("Error: Could not generate or save menu.");
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
                <p className="text-sm text-muted-foreground">Auto-generate poster and update menu in one click.</p>
            </div>
        </div>

        <Card className="border-0 shadow-md">
            <CardContent className="p-6 space-y-6">
                
                {/* Hidden Canvas */}
                <canvas ref={canvasRef} className="hidden" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FloatingInput label="Menu Name" value={name} onChange={(e) => setName(e.target.value)} />
                    <FloatingInput label="Price (₹)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>

                {/* Item List Manager */}
                <div className="space-y-3 bg-muted/30 p-4 rounded-xl border">
                    <Label>Menu Items (Used in Poster)</Label>
                    
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

                <Button onClick={handleSave} className="w-full h-12 text-lg shadow-lg shadow-primary/20 bg-green-600 hover:bg-green-700" disabled={isSaving}>
                    {isSaving ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" /> 
                            Creating & Publishing...
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5 mr-2" />
                            Update & Publish
                        </>
                    )}
                </Button>

            </CardContent>
        </Card>
    </div>
  );
}