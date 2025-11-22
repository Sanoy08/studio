// src/components/shop/ProductCard.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Badge } from '../ui/badge';
import { differenceInDays } from 'date-fns';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'; // Ensure this constant exists

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { state, addItem, updateQuantity } = useCart();
  const cartItem = state.items.find(item => item.id === product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
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

  // SAFE IMAGE LOGIC:
  // Check if images array exists, has items, and the first item has a valid URL string.
  const imageSrc = (product.images && product.images.length > 0 && product.images[0].url) 
    ? product.images[0].url 
    : PLACEHOLDER_IMAGE_URL;

  return (
    <Card className="flex flex-col overflow-hidden h-full transition-shadow hover:shadow-lg bg-card group">
      <Link href={`/menus/${product.slug}`} className="block aspect-square relative">
        {isNew && (
            <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground z-10">NEW</Badge>
        )}
        <Image
          src={imageSrc}
          alt={product.name}
          width={300}
          height={300}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute bottom-2 right-2">
            {cartItem ? (
                 <div className="flex items-center h-8 bg-background/80 backdrop-blur-sm rounded-full shadow-md">
                    <Button variant="ghost" size="icon" className="h-full w-8 rounded-full" onClick={handleDecrease}>
                        <Minus className="h-4 w-4 text-primary" />
                    </Button>
                    <span className="w-8 text-center font-medium text-sm">{cartItem.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-full w-8 rounded-full" onClick={handleIncrease}>
                        <Plus className="h-4 w-4 text-primary" />
                    </Button>
                </div>
            ) : (
                <Button size="icon" className="h-8 w-8 rounded-full shadow-md" onClick={handleAdd}>
                    <ShoppingCart className="h-4 w-4" />
                </Button>
            )}
        </div>
      </Link>
      <CardContent className="p-3 text-left flex-grow flex flex-col">
        <h3 className="font-semibold text-sm leading-tight flex-grow">{product.name}</h3>
        <p className="font-bold text-base text-accent mt-1">{formatPrice(product.price)}</p>
      </CardContent>
    </Card>
  );
}