// src/app/(shop)/menus/[slug]/ProductDetailsClient.tsx

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { Plus, Minus, Star, ShoppingCart, Ban } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import type { Product, Image as ProductImage } from '@/lib/types';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';
import { ProductCard } from '@/components/shop/ProductCard';
import { Badge } from '@/components/ui/badge';

const fallbackImage: ProductImage = { 
  id: 'placeholder', 
  url: PLACEHOLDER_IMAGE_URL, 
  alt: 'Placeholder Image' 
};

export function ProductDetailsClient({ product, relatedProducts }: { product: Product, relatedProducts: Product[] }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  
  const validImages = product.images?.filter(img => img.url && img.url.trim() !== '') || [];
  const initialImage = validImages.length > 0 ? validImages[0] : fallbackImage;
  const [mainImage, setMainImage] = useState(initialImage);

  // স্টক চেক
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (!isOutOfStock) {
        addItem(product, quantity);
    }
  };
  
  const isNonVeg = ['Chicken', 'Mutton', 'Egg', 'Fish'].includes(product.category?.name || '');

  return (
    <div className="bg-background min-h-screen">
      <div className="container py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Column - Image */}
          <div className="space-y-4">
            <div className={`relative aspect-square rounded-xl overflow-hidden border bg-card ${isOutOfStock ? 'grayscale' : ''}`}>
               {/* আউট অফ স্টক হলে ইমেজের ওপর একটি লেবেল */}
               {isOutOfStock && (
                  <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
                      <div className="bg-destructive text-destructive-foreground px-6 py-3 rounded-full font-bold text-xl shadow-lg rotate-[-12deg]">
                          SOLD OUT
                      </div>
                  </div>
               )}
              <Image
                src={mainImage.url || PLACEHOLDER_IMAGE_URL}
                alt={mainImage.alt || product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {validImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {validImages.map((image) => (
                  <button
                    key={image.id}
                    className={`relative w-20 h-20 rounded-md overflow-hidden border-2 flex-shrink-0 transition-all ${
                      mainImage.id === image.id ? 'border-primary' : 'border-transparent hover:border-primary/50'
                    } ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
                    onClick={() => setMainImage(image)}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || product.name}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Right Column - Details */}
          <div className="flex flex-col h-full">
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className={`border px-2 py-0.5 text-xs font-bold rounded flex items-center gap-1 ${isNonVeg ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${isNonVeg ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        {isNonVeg ? 'Non-Veg' : 'Veg'}
                    </div>
                    {product.featured && (
                        <Badge variant="secondary" className="text-[10px] bg-yellow-100 text-yellow-800 border-yellow-200">
                            Bestseller
                        </Badge>
                    )}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold font-headline text-foreground">{product.name}</h1>
                <p className="text-muted-foreground text-lg">{product.category?.name}</p>

                <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center bg-green-600 text-white px-2 py-0.5 rounded text-sm font-bold">
                        <span className="mr-1">{product.rating}</span> <Star className="w-3 h-3 fill-white" />
                    </div>
                    <span className="text-sm text-muted-foreground">({product.reviewCount || 10} reviews)</span>
                </div>
            </div>
            
            <div className="mt-6 pb-6 border-b border-dashed">
                <p className="text-4xl font-bold text-primary">{formatPrice(product.price)}</p>
                <p className="text-sm text-muted-foreground">inclusive of all taxes</p>
            </div>

            <div className="mt-8 space-y-6">
                {isOutOfStock ? (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 flex items-center gap-3">
                        <Ban className="h-6 w-6" />
                        <div>
                            <p className="font-bold text-lg">Currently Unavailable</p>
                            <p className="text-sm text-red-500">This item is out of stock at the moment.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <div className="flex items-center justify-between border rounded-lg bg-card w-full sm:w-40 h-12 px-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => q + 1)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button size="lg" className="flex-1 h-12 text-lg gap-2 shadow-lg shadow-primary/20" onClick={handleAddToCart}>
                            <ShoppingCart className="h-5 w-5" /> Add to Cart
                        </Button>
                    </div>
                )}
            </div>

            <div className="mt-10">
                <h2 className="text-xl font-bold mb-3 font-headline border-l-4 border-primary pl-3">Description</h2>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-base">
                    {product.description || "No description available for this delicious dish."}
                </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
            <div className="mt-24">
                <h2 className="text-3xl font-bold font-headline mb-8 text-center">You May Also Like</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {relatedProducts.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}