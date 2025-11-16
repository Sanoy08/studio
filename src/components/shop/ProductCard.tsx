'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Badge } from '../ui/badge';
import { differenceInDays } from 'date-fns';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { state, addItem, updateQuantity } = useCart();
  const cartItem = state.items.find(item => item.id === product.id);

  const handleAdd = () => {
    addItem(product);
  };

  const handleIncrease = () => {
    if (cartItem) {
      updateQuantity(product.id, cartItem.quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (cartItem) {
      updateQuantity(product.id, cartItem.quantity - 1);
    }
  };

  const isNew = product.createdAt && differenceInDays(new Date(), new Date(product.createdAt)) < 7;

  return (
    <Card className="flex flex-col overflow-hidden h-full transition-shadow hover:shadow-lg bg-card group">
      <Link href={`/products/${product.slug}`} className="block aspect-square relative">
        {isNew && (
            <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">NEW</Badge>
        )}
        <Image
          src={product.images[0].url}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </Link>
      <CardContent className="p-3 text-center flex-grow flex flex-col">
        <h3 className="font-semibold text-sm leading-tight mt-1 flex-grow">{product.name}</h3>
        <div className="flex justify-between items-center mt-2">
            <p className="font-bold text-base text-accent">{formatPrice(product.price)}</p>
            {cartItem ? (
                 <div className="flex items-center">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-primary/10 text-primary" onClick={handleDecrease}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{cartItem.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-primary/10 text-primary" onClick={handleIncrease}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <Button size="icon" className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAdd}>
                    <Plus className="h-4 w-4" />
                </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
