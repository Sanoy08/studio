'use client';

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import Image from 'next/image';
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function CartSheet() {
  const { state, itemCount, totalPrice, updateQuantity, removeItem } = useCart();
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {itemCount}
            </span>
          )}
          <span className="sr-only">Open cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Your Cart ({itemCount})</SheetTitle>
        </SheetHeader>
        {itemCount > 0 ? (
          <>
            <div className="flex-grow overflow-y-auto -mr-6 pr-6">
              <div className="flex flex-col gap-4 py-4">
                {state.items.map(item => (
                  <div key={item.id} className="flex items-start gap-4">
                    <Link href={`/menus/${item.slug}`} className="flex-shrink-0">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                         <Image src={item.image.url} alt={item.name} fill objectFit="cover" />
                      </div>
                    </Link>
                    <div className="flex-grow">
                      <Link href={`/menus/${item.slug}`}>
                        <p className="font-medium hover:text-primary">{item.name}</p>
                      </Link>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center">{item.quantity}</span>
                         <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <SheetFooter className="mt-auto border-t pt-4">
                <div className="w-full space-y-4">
                    <div className="flex justify-between font-semibold text-lg">
                        <span>Subtotal</span>
                        <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button asChild size="lg" variant="outline">
                          <Link href="/cart">View Cart</Link>
                      </Button>
                      <Button asChild size="lg" className="w-full">
                          <Link href="/checkout">Checkout</Link>
                      </Button>
                    </div>
                </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Add some products to get started.</p>
            <SheetTrigger asChild>
                <Button asChild variant="link" className="mt-4 text-primary">
                    <Link href="/menus">Continue Shopping</Link>
                </Button>
            </SheetTrigger>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
