'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { Plus, Minus, Star } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/shop/ProductCard';

export function ProductDetailsClient({ product, relatedProducts }: { product: Product, relatedProducts: Product[] }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  
  const [mainImage, setMainImage] = useState(product.images[0]);

  const handleAddToCart = () => {
    addItem(product, quantity);
  };
  
  const isNonVeg = product.category.name === 'Chicken' || product.category.name === 'Mutton' || product.category.name === 'Egg';

  return (
    <div className="bg-background">
      <div className="container py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Image Gallery */}
          <div>
            <div className="relative aspect-square rounded-lg overflow-hidden border mb-4">
              <Image
                src={mainImage.url}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image) => (
                <div
                  key={image.id}
                  className={`relative aspect-square rounded-md overflow-hidden border-2 cursor-pointer ${mainImage.id === image.id ? 'border-primary' : 'border-transparent'}`}
                  onClick={() => setMainImage(image)}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Column - Product Details */}
          <div className="pt-8">
            <div className="flex items-center gap-4 mb-2">
                <div className={`w-5 h-5 border flex items-center justify-center ${isNonVeg ? 'border-red-600' : 'border-green-600'}`}>
                    <div className={`w-3 h-3 rounded-full ${isNonVeg ? 'bg-red-600' : 'bg-green-600'}`}></div>
                </div>
                <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-bold">{product.rating}</span>
                </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold font-headline">{product.name}</h1>
            
            <p className="text-3xl font-bold text-accent my-4">{formatPrice(product.price)}</p>

            <div className="flex items-center gap-4 mb-6">
              <p className="font-medium">Quantity</p>
              <div className="flex items-center border rounded-md">
                  <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                      <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => q + 1)}>
                      <Plus className="h-4 w-4" />
                  </Button>
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={handleAddToCart}>
                Add to Cart
            </Button>
          </div>
        </div>

        <div className="mt-12">
            <h2 className="text-2xl font-bold font-headline mb-4">About This Item</h2>
            <p className="text-muted-foreground">{product.description}</p>
        </div>
        
        {/* Rating Section */}
        <div className="mt-12 text-center bg-card p-8 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Enjoyed the meal? Rate it!</h3>
            <div className="flex justify-center gap-2 my-4">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-8 w-8 text-gray-300 cursor-pointer hover:text-amber-400" />
                ))}
            </div>
            <Button>Submit Rating</Button>
        </div>


        {/* Related Products */}
        {relatedProducts.length > 0 && (
            <div className="mt-16">
                <h2 className="text-2xl font-bold font-headline mb-6 text-center">You May Also Like</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
