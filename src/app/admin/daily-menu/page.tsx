// src/app/admin/daily-menu/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Plus, Trash2, UtensilsCrossed, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { FloatingInput } from '@/components/ui/floating-input';

export default function DailyMenuPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [name, setName] = useState("Special Veg Thali");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
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
                setImageUrl(d.imageUrl);
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

  // ★★★ আপডেটেড অটোমেটিক ইমেজ জেনারেটর (১৫০০x১৫০০) ★★★
  const generateAndUploadImage = async () => {
    if (!canvasRef.current) return;
    setIsGenerating(true);

    try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // ★ ১. ক্যানভাস সাইজ আপডেট (১৫০০x১৫০০) ★
        const SCALE_FACTOR = 3; // আগের ৫০০ এর ৩ গুণ
        canvas.width = 500 * SCALE_FACTOR; // 1500
        canvas.height = 500 * SCALE_FACTOR; // 1500

        // স্কেলিং অ্যাপ্লাই করা যাতে আগের কোঅর্ডিনেটগুলো ঠিক থাকে
        ctx.scale(SCALE_FACTOR, SCALE_FACTOR);

        const bgImage = new Image();
        bgImage.src = '/daily.jpg'; 
        bgImage.crossOrigin = "anonymous";

        await new Promise((resolve, reject) => {
            bgImage.onload = resolve;
            bgImage.onerror = reject;
        });

        // ব্যাকগ্রাউন্ড ড্র করা (অরিজিনাল সাইজে, তাই ৫০০x৫০০ ই থাকবে লজিকালি)
        ctx.drawImage(bgImage, 0, 0, 500, 500);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // --- ২. তারিখ (Date) ---
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


        // --- ৩. মেনু আইটেম (Menu Items) ---
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


        // --- ৪. দাম (Price) ---
        ctx.save();
        ctx.translate(79, 231);
        ctx.fillStyle = "#000000ff"; 
        ctx.font = "italic bold 32px sans-serif"; 
        ctx.fillText(`₹${price}`, 0, 0);
        ctx.restore();

        // ★ নিচের লোগো রিমুভ করা হয়েছে ★

        // ৩. আপলোড প্রসেস
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', 0.9));
        if (!blob) throw new Error("Canvas conversion failed");

        const formData = new FormData();
        formData.append('file', blob);
        
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME_DISHES || "dk1acdtja";
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_DISHES || "bumbas-kitchen-dishes";
        formData.append('upload_preset', uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();
        if (data.secure_url) {
            setImageUrl(data.secure_url);
            toast.success("High-Quality Poster Generated! ✨");
        } else {
            throw new Error("Upload failed");
        }

    } catch (error) {
        console.error(error);
        toast.error("Failed to generate image.");
    } finally {
        setIsGenerating(false);
    }
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
                items, 
                imageUrl,
                inStock,
                notifyUsers
            })
        });

        const data = await res.json();
        if (res.ok) {
            toast.success("Daily menu updated!");
            setNotifyUsers(false); 
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
                <p className="text-sm text-muted-foreground">Create today's special menu poster automatically.</p>
            </div>
        </div>

        <Card className="border-0 shadow-md">
            <CardContent className="p-6 space-y-6">
                
                <canvas ref={canvasRef} className="hidden" />

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <Label>Menu Poster</Label>
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={generateAndUploadImage}
                            disabled={isGenerating || !price}
                            className="text-amber-600 border-amber-200 hover:bg-amber-50"
                        >
                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                            Auto Generate Poster
                        </Button>
                    </div>
                    
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