'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

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


  return (
    <Card className="flex flex-col overflow-hidden h-full transition-shadow hover:shadow-lg bg-card">
      <Link href={`/products/${product.slug}`} className="block aspect-square relative">
        <Image
          src={product.images[0].url}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
      </Link>
      <CardContent className="p-3 text-center flex-grow flex flex-col">
        <h3 className="font-semibold text-sm leading-tight mt-1 flex-grow">{product.name}</h3>
        <div className="flex justify-between items-center mt-2">
            <p className="font-bold text-base text-accent">₹{product.price}</p>
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
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={handleAdd}>
                    <Plus className="h-4 w-4" />
                </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
