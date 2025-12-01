// src/components/shop/ProductCard.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { Plus, Minus, ShoppingCart, Ban } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Badge } from '../ui/badge';
import { differenceInDays } from 'date-fns';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';
import type { Product, CartItem } from '@/lib/types'; // CartItem যোগ করুন

type ProductCardProps = {
  product: Product;
};

// ★★★ নতুন হেল্পার ফাংশন: ক্লাউডিনারি ইমেজ অপ্টিমাইজেশন ★★★
// এটি ছবির সাইজ ছোট করে লোডিং স্পিড বাড়াবে এবং ল্যাগ কমাবে
const getOptimizedImageUrl = (url: string) => {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  
  // যদি ইতিমধ্যে অপ্টিমাইজ করা থাকে তবে স্কিপ করব
  if (url.includes('/q_') || url.includes('/w_')) return url;
  
  // w_500: উইডথ ৫০০ পিক্সেল (কার্ডের জন্য যথেষ্ট, মোবাইলের জন্য পারফেক্ট)
  // q_auto: অটোমেটিক কোয়ালিটি (চোখে পার্থক্য বোঝা যাবে না কিন্তু সাইজ কমবে)
  // f_auto: অটোমেটিক ফরম্যাট (webp বা avif ব্যবহার করবে যা ফাস্ট লোড হয়)
  return url.replace('/upload/', '/upload/w_500,q_auto,f_auto/');
};

export function ProductCard({ product }: ProductCardProps) {
  const { state, addItem, updateQuantity } = useCart();
// item: any এর বদলে item: CartItem ব্যবহার করুন
const cartItem = state.items.find((item: CartItem) => item.id === product.id);

  const isOutOfStock = product.stock <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
        addItem(product);
    }
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(product.id, cartItem.quantity + 1);
    }
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(product.id, cartItem.quantity - 1);
    }
  };

  const isNew = product.createdAt && differenceInDays(new Date(), new Date(product.createdAt)) < 7;

  // ★★★ অপ্টিমাইজ করা ইমেজ URL তৈরি ★★★
  const rawImageSrc = (product.images && product.images.length > 0 && product.images[0].url) 
    ? product.images[0].url 
    : PLACEHOLDER_IMAGE_URL;

  // এখানে আমাদের নতুন ফাংশন ব্যবহার করা হচ্ছে
  const imageSrc = getOptimizedImageUrl(rawImageSrc);

  return (
    <Card className={`flex flex-col overflow-hidden h-full transition-shadow hover:shadow-lg bg-card group border-muted/60 ${isOutOfStock ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      
      <Link href={`/menus/${product.slug}`} className="block aspect-square relative overflow-hidden">
        {isOutOfStock ? (
            <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground z-10 shadow-sm pointer-events-none">
                Out of Stock
            </Badge>
        ) : isNew && (
            <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground z-10 shadow-sm">
                NEW
            </Badge>
        )}
        
        <Image
          src={imageSrc} // অপ্টিমাইজড ইমেজ সোর্স
          alt={product.name}
          width={500} // কার্ডের জন্য ৫০০ পিক্সেল যথেষ্ট
          height={500}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        
        {isOutOfStock && (
            <div className="absolute inset-0 bg-background/30 z-0" />
        )}
      </Link>
      
      <CardContent className="p-3 flex flex-col flex-grow gap-2">
        <h3 
            className="font-semibold text-sm leading-tight line-clamp-2 h-10 text-foreground/90" 
            title={product.name}
        >
            {product.name}
        </h3>
        
        <div className="flex items-center justify-between mt-auto pt-1">
            <p className={`font-bold text-base ${isOutOfStock ? 'text-muted-foreground' : 'text-primary'}`}>
                {formatPrice(product.price)}
            </p>
            
            <div onClick={(e) => e.preventDefault()}>
                {isOutOfStock ? (
                    <Button 
                        size="sm" 
                        disabled 
                        className="h-8 px-3 rounded-full bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-70"
                    >
                        <Ban className="h-3.5 w-3.5 mr-1" /> 
                        <span className="text-xs font-medium">Sold Out</span>
                    </Button>
                ) : cartItem ? (
                    <div className="flex items-center h-8 border border-primary/30 rounded-full bg-background shadow-sm">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-l-full hover:bg-primary/10 hover:text-primary transition-colors" 
                            onClick={handleDecrease}
                        >
                            <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center font-bold text-sm">{cartItem.quantity}</span>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-r-full hover:bg-primary/10 hover:text-primary transition-colors" 
                            onClick={handleIncrease}
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                ) : (
                    <Button 
                        size="sm" 
                        className="h-8 px-4 rounded-full shadow-sm gap-1.5 bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95" 
                        onClick={handleAdd}
                    >
                        <ShoppingCart className="h-3.5 w-3.5" /> 
                        <span className="text-xs font-semibold">Add</span>
                    </Button>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}