// src/app/(shop)/menus/[slug]/ProductDetailsClient.tsx

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { Plus, Minus, Star, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import type { Product, Image as ProductImage } from '@/lib/types';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';
import { ProductCard } from '@/components/shop/ProductCard';

// ফলব্যাক ইমেজের অবজেক্ট তৈরি
const fallbackImage: ProductImage = { 
  id: 'placeholder', 
  url: PLACEHOLDER_IMAGE_URL, 
  alt: 'Placeholder Image' 
};

export function ProductDetailsClient({ product, relatedProducts }: { product: Product, relatedProducts: Product[] }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  
  // ১. শুধুমাত্র ভ্যালিড (ফাঁকা নয় এমন) ইমেজগুলো ফিল্টার করে নেওয়া হচ্ছে
  const validImages = product.images?.filter(img => img.url && img.url.trim() !== '') || [];

  // ২. যদি কোনো ভ্যালিড ইমেজ না থাকে, তবে ফলব্যাক ইমেজ ব্যবহার করা হবে
  const initialImage = validImages.length > 0 ? validImages[0] : fallbackImage;
  
  // ৩. স্টেট ইনিশিয়ালাইজেশন
  const [mainImage, setMainImage] = useState(initialImage);

  const handleAddToCart = () => {
    addItem(product, quantity);
  };
  
  // ক্যাটাগরি চেক (Optional check, depends on your data structure)
  const isNonVeg = ['Chicken', 'Mutton', 'Egg', 'Fish'].includes(product.category?.name || '');

  return (
    <div className="bg-background min-h-screen">
      <div className="container py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Column - Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden border bg-card">
              {/* ৪. মেইন ইমেজ রেন্ডারিং - এখানে নিশ্চিত করা হয়েছে src কখনো ফাঁকা হবে না */}
              <Image
                src={mainImage.url || PLACEHOLDER_IMAGE_URL}
                alt={mainImage.alt || product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* ৫. থাম্বনেইল গ্যালারি - শুধুমাত্র যদি একাধিক ভ্যালিড ইমেজ থাকে */}
            {validImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {validImages.map((image) => (
                  <button
                    key={image.id}
                    className={`relative w-20 h-20 rounded-md overflow-hidden border-2 flex-shrink-0 transition-all ${
                      mainImage.id === image.id ? 'border-primary' : 'border-transparent hover:border-primary/50'
                    }`}
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
          
          {/* Right Column - Product Details */}
          <div className="flex flex-col h-full">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className={`border px-2 py-0.5 text-xs font-bold rounded flex items-center gap-1 ${isNonVeg ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${isNonVeg ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        {isNonVeg ? 'Non-Veg' : 'Veg'}
                    </div>
                    <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-bold">
                        <Star className="w-3 h-3 fill-amber-800" />
                        <span>{product.rating}</span>
                    </div>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold font-headline text-foreground">{product.name}</h1>
                <p className="text-muted-foreground">{product.category?.name}</p>
            </div>
            
            <div className="mt-6">
                <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>
                <p className="text-sm text-muted-foreground">inclusive of all taxes</p>
            </div>

            <div className="mt-8 space-y-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center border rounded-lg bg-card">
                        <Button variant="ghost" size="icon" className="h-12 w-12" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                        <Button variant="ghost" size="icon" className="h-12 w-12" onClick={() => setQuantity(q => q + 1)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button size="lg" className="flex-1 h-12 text-lg gap-2" onClick={handleAddToCart}>
                        <ShoppingCart className="h-5 w-5" /> Add to Cart
                    </Button>
                </div>
            </div>

            <div className="mt-10">
                <h2 className="text-xl font-bold mb-3 font-headline">Description</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.description || "No description available for this delicious dish."}
                </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
            <div className="mt-20">
                <h2 className="text-2xl font-bold font-headline mb-8">You May Also Like</h2>
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