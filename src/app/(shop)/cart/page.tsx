// src/app/(shop)/cart/page.tsx

'use client';

import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';

export default function CartPage() {
  const { state, itemCount, totalPrice, updateQuantity, removeItem } =
    useCart();
  const router = useRouter();

  return (
    <div className="container py-12">
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8 text-center">
        Your Cart
      </h1>
      {itemCount > 0 ? (
        <div className="grid lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {state.items.map((item) => {
                    const imageSrc = (item.image && item.image.url && item.image.url.trim() !== '') 
                      ? item.image.url 
                      : PLACEHOLDER_IMAGE_URL;
                    
                    return (
                      <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <Link href={`/menus/${item.slug}`}>
                            <div className="relative h-20 w-20 rounded-md overflow-hidden border bg-muted">
                              <Image
                                src={imageSrc}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </Link>
                          <div>
                            <Link href={`/menus/${item.slug}`}>
                              <p className="font-semibold hover:text-primary">{item.name}</p>
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="font-semibold w-20 text-right">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Subtotal</p>
                    <p>{formatPrice(totalPrice)}</p>
                  </div>
                  {/* Shipping and Taxes REMOVED */}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between font-bold text-lg">
                  <p>Total</p>
                  <p>{formatPrice(totalPrice)}</p>
                </div>
              </CardContent>
              <CardFooter>
    {/* ★★★ পরিবর্তন: বাটন টেক্সট এবং অনক্লিক ফাংশন ★★★ */}
    <Button
        size="lg"
        className="w-full"
        onClick={() => router.push('/checkout/summary')} // নতুন পেজে যাবে
    >
        Proceed to Summary
    </Button>
</CardFooter>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground" />
          <h2 className="mt-6 text-2xl font-bold">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Button asChild className="mt-6">
            <Link href="/menus">Continue Shopping</Link>
          </Button>
        </div>
      )}
    </div>
  );
}