// src/app/(shop)/menus/[slug]/ProductDetailsClient.tsx

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { Plus, Minus, Star, ShoppingCart, Heart, Share2, Clock, Flame, Ban, ChevronRight, Info } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import type { Product, Image as ProductImage } from '@/lib/types';
import { ProductCard } from '@/components/shop/ProductCard';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const getOptimizedImageUrl = (url: string) => {
  if (!url) return PLACEHOLDER_IMAGE_URL;
  if (!url.includes('res.cloudinary.com')) return url;
  if (url.includes('/q_') || url.includes('/w_')) return url;
  return url.replace('/upload/', '/upload/w_800,q_auto,f_auto/');
};

const fallbackImage: ProductImage = { 
  id: 'placeholder', 
  url: PLACEHOLDER_IMAGE_URL, 
  alt: 'Placeholder Image' 
};

export function ProductDetailsClient({ product, relatedProducts }: { product: Product, relatedProducts: Product[] }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const validImages = product.images?.filter(img => img.url && img.url.trim() !== '') || [];
  const displayImages = validImages.length > 0 ? validImages : [fallbackImage];

  const isOutOfStock = product.stock <= 0;
  const isNonVeg = ['Chicken', 'Mutton', 'Egg', 'Fish'].includes(product.category?.name || '');

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
      setActiveSlide(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    if (api) api.scrollTo(activeSlide);
  }, [activeSlide, api]);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    toast.success(`Added ${quantity} ${product.name} to cart`);
  };

  const handleShare = () => {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
  };

  return (
    <div className="bg-white min-h-screen pb-24 md:pb-12 w-full max-w-[100vw] overflow-x-hidden">
      
      {/* --- MOBILE TOP IMAGE SLIDER --- */}
      <div className="md:hidden w-full relative group">
         <Carousel setApi={setApi} className="w-full">
            <CarouselContent className="-ml-0">
                {displayImages.map((img, index) => (
                <CarouselItem key={index} className="pl-0 basis-full">
                    <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
                        <Image
                            src={getOptimizedImageUrl(img.url)}
                            alt={img.alt || product.name}
                            fill
                            className={cn("object-cover", isOutOfStock && "grayscale opacity-80")}
                            priority={index === 0}
                        />

                        {isOutOfStock && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
                                <span className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold text-lg shadow-lg transform -rotate-6">
                                    SOLD OUT
                                </span>
                            </div>
                        )}
                    </div>
                </CarouselItem>
                ))}
            </CarouselContent>
         </Carousel>

         {/* ❌ Removed Back Button */}
         {/* <Link href="/menus" ...> ... </Link> */}

         {/* Top Buttons (Mobile) */}
         <div className="absolute top-4 right-4 flex justify-end z-20 pointer-events-none">
             <button onClick={handleShare} className="bg-white/90 p-2 rounded-full shadow-sm text-gray-700 pointer-events-auto hover:bg-white transition-colors">
                 <Share2 className="h-5 w-5" />
             </button>
         </div>

         {/* Dots */}
         {displayImages.length > 1 && (
             <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
                 {displayImages.map((_, idx) => (
                     <button
                        key={idx}
                        onClick={() => api?.scrollTo(idx)}
                        className={cn(
                            "h-1.5 rounded-full transition-all shadow-sm pointer-events-auto",
                            current === idx + 1 ? "w-4 bg-white" : "w-1.5 bg-white/60 hover:bg-white/80"
                        )}
                     />
                 ))}
             </div>
         )}
      </div>

      <div className="container px-4 md:px-8 py-6 md:py-10 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          
          {/* Desktop Images */}
          <div className="hidden md:block space-y-4">
   <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border">

                 <Image
                    src={getOptimizedImageUrl(displayImages[activeSlide].url)}
                    alt={product.name}
                    fill
                    className={cn("object-cover transition-all duration-500", isOutOfStock && "grayscale opacity-80")}
                    priority
                 />

                 {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <span className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold text-2xl shadow-xl transform -rotate-12">
                            SOLD OUT
                        </span>
                    </div>
                 )}

                 <div className="absolute top-4 right-4">
                     <button onClick={handleShare} className="bg-white p-2.5 rounded-full shadow-md hover:bg-gray-50 text-gray-700 transition-colors">
                         <Share2 className="h-5 w-5" />
                     </button>
                 </div>
             </div>

             {/* Thumbnails */}
             {displayImages.length > 1 && (
                 <div className="grid grid-cols-4 gap-0 w-full">

                     {displayImages.map((img, idx) => (
                         <button 
  key={idx}
  onClick={() => setActiveSlide(idx)}
  className={cn(
      "relative w-full aspect-square overflow-hidden transition-all",
      activeSlide === idx ? "opacity-100" : "opacity-70 hover:opacity-100"
  )}
>
  <Image 
    src={getOptimizedImageUrl(img.url)} 
    alt="thumb" 
    fill 
    className="object-cover"
  />
</button>

                     ))}
                 </div>
             )}
          </div>
          
          {/* PRODUCT INFO */}
          <div className="flex flex-col h-full md:pt-2">

            <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                     <div className={cn(
                        "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border rounded-md flex items-center gap-1.5",
                        isNonVeg ? "border-red-200 text-red-700 bg-red-50" : "border-green-200 text-green-700 bg-green-50"
                    )}>
                        <div className={cn("w-2 h-2 rounded-full", isNonVeg ? "bg-red-600" : "bg-green-600")}></div>
                        {isNonVeg ? 'Non-Veg' : 'Veg'}
                    </div>

                    {product.rating > 0 && (
                        <div className="flex items-center gap-1 text-sm font-bold bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-100">
                            {product.rating} <Star className="w-3.5 h-3.5 fill-green-700" />
                        </div>
                    )}
                </div>

                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                    {product.name}
                </h1>
                <p className="text-base md:text-xl text-muted-foreground">{product.category.name}</p>

                <div className="flex flex-wrap gap-2">
                    {product.featured && <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Bestseller</Badge>}
                    {product.isDailySpecial && <Badge className="bg-primary/10 text-primary">Today's Special</Badge>}
                </div>
            </div>

            <div className="my-6 h-px bg-gray-100 w-full"></div>

            <div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-extrabold text-gray-900">
                        {formatPrice(product.price)}
                    </span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Info className="h-3.5 w-3.5" /> Inclusive of all taxes
                </p>
            </div>

            {/* Desktop Add to Cart */}
            <div className="hidden md:block mt-8">
                {!isOutOfStock ? (
                    <div className="flex gap-4">
                        <div className="flex items-center border rounded-xl h-12 w-32 bg-gray-50">
                            <Button variant="ghost" className="h-full px-3" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus /></Button>
                            <span className="flex-1 text-center font-bold text-lg">{quantity}</span>
                            <Button variant="ghost" className="h-full px-3" onClick={() => setQuantity(q => q + 1)}><Plus /></Button>
                        </div>

                        <Button className="flex-1 h-12 rounded-xl text-lg font-bold" onClick={handleAddToCart}>
                            <ShoppingCart className="mr-2" /> Add to Cart — {formatPrice(product.price * quantity)}
                        </Button>
                    </div>
                ) : (
                    <div className="w-full p-4 bg-gray-100 text-gray-500 rounded-xl text-center font-medium border border-gray-200">
                        Currently Unavailable
                    </div>
                )}
            </div>

            {/* ❌ Removed: Freshly Prepared & 30–40 Mins */}
            {/* 
            <div className="grid grid-cols-2 gap-4 mt-6 text-sm text-gray-600">
                 <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <span>Freshly Prepared</span>
                 </div>
                 <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span>30-40 Mins</span>
                 </div>
            </div>
            */}

            <div className="mt-8">
                <h3 className="font-bold text-lg mb-2 text-gray-900">Description</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base whitespace-pre-line break-words">
                    {product.description || "A delicious delicacy prepared with authentic spices and fresh ingredients."}
                </p>
            </div>

          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
            <div className="mt-16 lg:mt-32 pt-10 border-t border-gray-100">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                    <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-900">Complete Your Meal</h2>
                    <Link href="/menus" className="text-primary font-medium hover:underline flex items-center gap-1">
                        See all <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
                    {relatedProducts.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* MOBILE ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 lg:hidden z-40">
        {!isOutOfStock ? (
            <div className="flex gap-3 items-center">
                 <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg h-12 px-1">
                    <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus /></Button>
                    <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                    <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)}><Plus /></Button>
                </div>

                <Button className="flex-1 h-12 rounded-lg font-bold flex justify-between px-6" onClick={handleAddToCart}>
                    <span>Add Item</span>
                    <span>{formatPrice(product.price * quantity)}</span>
                </Button>
            </div>
        ) : (
             <Button disabled className="w-full h-12 rounded-lg font-bold bg-muted text-muted-foreground">
                <Ban className="h-4 w-4 mr-2" /> Item Sold Out
            </Button>
        )}
      </div>

    </div>
  );
}

