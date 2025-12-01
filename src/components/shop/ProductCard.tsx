// src/components/shop/ProductCard.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Product, CartItem } from '@/lib/types'; // CartItem যোগ করুন
import { formatPrice } from '@/lib/utils';
import { Plus, Minus, ShoppingCart, Ban } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Badge } from '../ui/badge';
import { differenceInDays } from 'date-fns';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';
import { SpecialDishCard } from './SpecialDishCard'; // ★ ইমপোর্ট

type ProductCardProps = {
  product: Product;
};

const getOptimizedImageUrl = (url: string) => {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  if (url.includes('/q_') || url.includes('/w_')) return url;
  return url.replace('/upload/', '/upload/w_500,q_auto,f_auto/');
};

export function ProductCard({ product }: ProductCardProps) {
  const { state, addItem, updateQuantity } = useCart();
const cartItem = state.items.find((item: CartItem) => item.id === product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isOutOfStock) addItem(product);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (cartItem) updateQuantity(product.id, cartItem.quantity + 1);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (cartItem) updateQuantity(product.id, cartItem.quantity - 1);
  };

  const isNew = product.createdAt && differenceInDays(new Date(), new Date(product.createdAt)) < 7;

  // ★ ইমেজ চেক লজিক ★
  const hasValidImage = product.images && product.images.length > 0 && product.images[0].url && product.images[0].url.trim() !== '';
  const imageSrc = hasValidImage ? getOptimizedImageUrl(product.images[0].url) : PLACEHOLDER_IMAGE_URL;

  // ★ যদি স্পেশাল আইটেম হয় এবং কোনো ইমেজ না থাকে, তবে স্পেশাল কার্ড দেখাও ★
  if (product.isDailySpecial && !hasValidImage) {
      return (
          <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow cursor-pointer group border-amber-200 shadow-md bg-amber-50/30">
              <Link href={`/menus/${product.slug}`} className="block h-full flex flex-col">
                  <div className="aspect-square relative w-full">
                      <SpecialDishCard 
                          name={product.name} 
                          description={product.description} 
                          price={product.price} 
                      />
                      {/* Overlay Button on Hover */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                         <Button size="icon" className="rounded-full shadow-lg h-12 w-12" onClick={handleAdd}>
                            <ShoppingCart className="h-5 w-5" />
                         </Button>
                      </div>
                  </div>
              </Link>
          </Card>
      );
  }

  // ... (নরমাল কার্ড রেন্ডারিং - আগের মতোই থাকবে)
  return (
    <Card className={`flex flex-col overflow-hidden h-full transition-shadow hover:shadow-lg bg-card group border-muted/60 ${isOutOfStock ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      <Link href={`/menus/${product.slug}`} className="block aspect-square relative overflow-hidden">
        {isOutOfStock ? (
            <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground z-10 shadow-sm pointer-events-none">Out of Stock</Badge>
        ) : isNew && (
            <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground z-10 shadow-sm">NEW</Badge>
        )}
        <Image src={imageSrc} alt={product.name} width={500} height={500} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
        {isOutOfStock && <div className="absolute inset-0 bg-background/30 z-0" />}
      </Link>
      <CardContent className="p-3 flex flex-col flex-grow gap-2">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 h-10 text-foreground/90" title={product.name}>{product.name}</h3>
        <div className="flex items-center justify-between mt-auto pt-1">
            <p className={`font-bold text-base ${isOutOfStock ? 'text-muted-foreground' : 'text-primary'}`}>{formatPrice(product.price)}</p>
            <div onClick={(e) => e.preventDefault()}>
                {isOutOfStock ? (
                    <Button size="sm" disabled className="h-8 px-3 rounded-full bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-70"><Ban className="h-3.5 w-3.5 mr-1" /> <span className="text-xs font-medium">Sold Out</span></Button>
                ) : cartItem ? (
                    <div className="flex items-center h-8 border border-primary/30 rounded-full bg-background shadow-sm">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-l-full hover:bg-primary/10 hover:text-primary transition-colors" onClick={handleDecrease}><Minus className="h-3 w-3" /></Button>
                        <span className="w-6 text-center font-bold text-sm">{cartItem.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-r-full hover:bg-primary/10 hover:text-primary transition-colors" onClick={handleIncrease}><Plus className="h-3 w-3" /></Button>
                    </div>
                ) : (
                    <Button size="sm" className="h-8 px-4 rounded-full shadow-sm gap-1.5 bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95" onClick={handleAdd}><ShoppingCart className="h-3.5 w-3.5" /> <span className="text-xs font-semibold">Add</span></Button>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}