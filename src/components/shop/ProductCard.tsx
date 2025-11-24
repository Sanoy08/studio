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
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';

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

  const imageSrc = (product.images && product.images.length > 0 && product.images[0].url) 
    ? product.images[0].url 
    : PLACEHOLDER_IMAGE_URL;

  return (
    <Card className="flex flex-col overflow-hidden h-full transition-shadow hover:shadow-lg bg-card group border-muted/60">
      
      {/* Image Section (Clean, no buttons overlay) */}
      <Link href={`/menus/${product.slug}`} className="block aspect-square relative overflow-hidden">
        {isNew && (
            <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground z-10 shadow-sm">NEW</Badge>
        )}
        <Image
          src={imageSrc}
          alt={product.name}
          width={300}
          height={300}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </Link>
      
      {/* Content Section */}
      <CardContent className="p-3 flex flex-col flex-grow gap-2">
        {/* Product Name */}
        <h3 
            className="font-semibold text-sm leading-tight line-clamp-2 h-10 text-foreground/90" 
            title={product.name}
        >
            {product.name}
        </h3>
        
        {/* Price and Action Row */}
        <div className="flex items-center justify-between mt-auto pt-1">
            <p className="font-bold text-base text-primary">{formatPrice(product.price)}</p>
            
            {/* Dynamic Add/Counter Button */}
            <div onClick={(e) => e.preventDefault()}> {/* Prevent Link click when clicking buttons */}
                {cartItem ? (
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