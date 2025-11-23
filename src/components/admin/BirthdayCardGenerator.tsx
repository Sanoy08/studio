// src/components/admin/BirthdayCardGenerator.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Move } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

  // Text Config
  const [textPos, setTextPos] = useState({
    offer: { x: 877, y: 1423, size: 65 },
    coupon: { x: 877, y: 1695, size: 88 },
    name: { x: 877, y: 976, size: 144 }
  });

  useEffect(() => {
    if (isOpen && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new window.Image(); // Explicitly use window.Image
        img.src = '/Elements/bdaytext.jpg'; // Make sure this image exists in public/Elements
        img.crossOrigin = "anonymous";
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            draw(ctx, img);
            setIsLoaded(true);
        };
    }
  }, [isOpen, customerName, date, couponCode]);

  const draw = (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(img, 0, 0);

    // Name
    ctx.font = `${textPos.name.size}px "Pacifico", cursive`; // Ensure font is loaded in layout
    ctx.fillStyle = '#e8cd00';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(customerName, textPos.name.x, textPos.name.y);

    // Offer Text
    ctx.font = `${textPos.offer.size}px "Poppins", sans-serif`;
    ctx.fillStyle = '#ffffff';
    const line1 = "As a small celebration from us, enjoy a";
    const line2 = `5% discount on your order on ${date}.`;
    ctx.fillText(line1, textPos.offer.x, textPos.offer.y);
    ctx.fillText(line2, textPos.offer.x, textPos.offer.y + textPos.offer.size + 10);

    // Coupon
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
      <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col p-0 bg-black/90 border-none">
        <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center">
            <canvas 
                ref={canvasRef} 
                className="max-w-full max-h-full object-contain shadow-2xl"
            />
            {!isLoaded && <p className="text-white">Loading template...</p>}
        </div>
        <div className="p-4 bg-background flex justify-between items-center">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={downloadCard} className="gap-2">
                <Download className="h-4 w-4" /> Download Card
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}