// src/components/admin/BirthdayCardGenerator.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface CardGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  date: string;
  couponCode: string;
}

export function BirthdayCardGenerator({ isOpen, onClose, customerName, date, couponCode }: CardGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false); // এরর ট্রেস করার জন্য

  const [textPos] = useState({
    offer: { x: 877, y: 1423, size: 65 },
    coupon: { x: 877, y: 1695, size: 88 },
    name: { x: 877, y: 976, size: 144 }
  });

  useEffect(() => {
    if (isOpen && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsLoaded(false);
        setHasError(false);

        const img = new window.Image();
        // সঠিক পাথ নিশ্চিত করুন
        img.src = '/Elements/bdaytext.jpg'; 
        
        // লোকাল ফাইলের জন্য crossOrigin দরকার নেই, তাই কমেন্ট করা হলো
        // img.crossOrigin = "anonymous"; 
        
        img.onload = () => {
            console.log("✅ Image loaded successfully!");
            canvas.width = img.width;
            canvas.height = img.height;
            draw(ctx, img);
            setIsLoaded(true);
        };

        // ★★★ ডিবাগিং এরর হ্যান্ডলার ★★★
        img.onerror = (err) => {
            console.error("❌ Failed to load image:", err);
            console.error("Image Source Tried:", img.src);
            setHasError(true);
            setIsLoaded(true); // লোডিং বন্ধ করা হলো যাতে এরর মেসেজ দেখানো যায়
        };
    }
  }, [isOpen, customerName, date, couponCode]);

  const draw = (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(img, 0, 0);

    ctx.font = `${textPos.name.size}px "Poppins", sans-serif`; 
    ctx.fillStyle = '#e8cd00';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(customerName, textPos.name.x, textPos.name.y);

    ctx.font = `${textPos.offer.size}px "Poppins", sans-serif`;
    ctx.fillStyle = '#ffffff';
    const line1 = "As a small celebration from us, enjoy a";
    const line2 = `5% discount on your order on ${date}.`;
    ctx.fillText(line1, textPos.offer.x, textPos.offer.y);
    ctx.fillText(line2, textPos.offer.x, textPos.offer.y + textPos.offer.size + 10);

    ctx.font = `bold ${textPos.coupon.size}px "Poppins", sans-serif`;
    ctx.fillStyle = '#e8cd00';
    ctx.fillText(`Use code: ${couponCode}`, textPos.coupon.x, textPos.coupon.y);
  };

  const downloadCard = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `birthday-wish-${customerName}.jpg`;
    link.href = canvasRef.current.toDataURL('image/jpeg');
    link.click();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col p-0 bg-black/90 border-none overflow-hidden">
        <DialogHeader className="sr-only">
            <DialogTitle>Birthday Card Generator</DialogTitle>
            <DialogDescription>Preview and download birthday card.</DialogDescription>
        </DialogHeader>

        <div className="relative flex-1 w-full h-full overflow-auto flex items-center justify-center p-4">
            <canvas 
                ref={canvasRef} 
                className={`max-w-full max-h-full object-contain shadow-2xl ${!isLoaded || hasError ? 'hidden' : ''}`}
            />
            
            {/* লোডিং স্টেট */}
            {!isLoaded && !hasError && (
                <div className="text-white flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <p>Loading template...</p>
                </div>
            )}

            {/* এরর স্টেট */}
            {hasError && (
                <div className="text-red-400 flex flex-col items-center gap-2 text-center p-4 bg-white/10 rounded-lg">
                    <AlertCircle className="h-10 w-10" />
                    <p className="font-bold">Image Not Found!</p>
                    <p className="text-sm text-white/80">
                        Please check if <code>public/Elements/bdaytext.jpg</code> exists.
                    </p>
                </div>
            )}
        </div>

        <div className="p-4 bg-background flex justify-between items-center shrink-0">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={downloadCard} disabled={!isLoaded || hasError} className="gap-2 bg-primary hover:bg-primary/90">
                <Download className="h-4 w-4" /> Download Card
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}