// src/components/shop/CartSheet.tsx

'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import Image from 'next/image';
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';

export function CartSheet() {
  const { state, itemCount, totalPrice, updateQuantity, removeItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-primary/10 transition-colors">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow-sm animate-in zoom-in duration-300">
              {itemCount}
            </span>
          )}
          <span className="sr-only">Open cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Your Cart <span className="text-muted-foreground text-sm font-normal">({itemCount} items)</span>
          </SheetTitle>
        </SheetHeader>
        
        {itemCount > 0 ? (
          <>
            <div className="flex-grow overflow-y-auto pr-2 -mr-2">
              <div className="flex flex-col gap-6 py-6">
                {state.items.map(item => {
                  const imageSrc = (item.image && item.image.url && item.image.url.trim() !== '') 
                    ? item.image.url 
                    : PLACEHOLDER_IMAGE_URL;

                  return (
                    <div key={item.id} className="flex gap-4 group">
                      <Link href={`/menus/${item.slug}`} className="flex-shrink-0 relative h-24 w-24 overflow-hidden rounded-xl border bg-muted">
                         <Image 
                            src={imageSrc} 
                            alt={item.name} 
                            fill 
                            className="object-cover transition-transform group-hover:scale-105"
                         />
                      </Link>
                      
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                            <Link href={`/menus/${item.slug}`}>
                                <h4 className="font-semibold text-base hover:text-primary transition-colors line-clamp-1">{item.name}</h4>
                            </Link>
                            <p className="text-sm text-muted-foreground font-medium mt-1">{formatPrice(item.price)}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border rounded-lg h-8 bg-background">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-l-lg hover:bg-muted" 
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-r-lg hover:bg-muted" 
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                <Plus className="h-3 w-3" />
                                </Button>
                            </div>

                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" 
                                onClick={() => removeItem(item.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Footer Section - শুধু এই অংশটুকু চেঞ্জ হবে */}
<SheetFooter className="mt-auto border-t pt-6 bg-background">
    <div className="w-full space-y-4">
        <div className="space-y-1.5">
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between font-bold text-xl pt-2 border-t mt-2">
                <span>Total</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 pt-2">
            <Button asChild size="lg" variant="outline" className="w-full rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary">
                <Link href="/cart">View Cart</Link>
            </Button>
            {/* ★★★ পরিবর্তন: Checkout এর বদলে Summary পেজে যাবে ★★★ */}
            <Button asChild size="lg" className="w-full rounded-xl shadow-lg shadow-primary/20">
                <Link href="/checkout/summary">Proceed</Link>
            </Button>
        </div>
    </div>
</SheetFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pb-12">
            <div className="h-24 w-24 bg-muted/30 rounded-full flex items-center justify-center mb-2">
                <ShoppingCart className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <div>
                <p className="text-xl font-bold text-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-[200px] mx-auto">Looks like you haven't added anything to your cart yet.</p>
            </div>
            <SheetTrigger asChild>
                <Button asChild className="mt-4 rounded-full px-8">
                    <Link href="/menus">Start Shopping</Link>
                </Button>
            </SheetTrigger>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}