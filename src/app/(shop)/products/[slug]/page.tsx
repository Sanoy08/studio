'use client';

import { notFound } from 'next/navigation';
import { products } from '@/lib/data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Rating } from '@/components/shared/Rating';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';
import { Plus, Minus, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import type { Product } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/shop/ProductCard';
import Link from 'next/link';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  
  const product = products.find(p => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    const productToAdd = product as Product;
    addItem(productToAdd, quantity);
  };
  
  const relatedProducts = products.filter(p => p.category.id === product.category.id && p.id !== product.id).slice(0, 4);

  return (
    <div className="bg-card">
      {/* Product Image Hero */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <Image
          src={product.images[0].url}
          alt={product.name}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 container">
            <Link href="/products" className="text-white/80 hover:text-white text-sm mb-2 block">&larr; Back to Menu</Link>
            <h1 className="text-3xl md:text-4xl font-bold font-headline text-white">{product.name}</h1>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-4">
              <Rating rating={product.rating} />
              <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>
            <p className="mt-4 text-muted-foreground">{product.description}</p>
            
            {/* Reviews Section */}
            <div id="reviews" className="mt-12">
              <h2 className="text-2xl font-bold font-headline mb-4">Customer Reviews</h2>
                {product.reviews.length > 0 ? (
                    <div className="space-y-6">
                        {product.reviews.map((review, index) => (
                            <div key={review.id}>
                                <div className="flex items-start gap-4">
                                    <div className="flex-grow">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold">{review.author}</p>
                                            <Rating rating={review.rating} />
                                        </div>
                                         <p className="text-xs text-muted-foreground">{review.date}</p>
                                        <p className="mt-2 text-sm text-muted-foreground">{review.text}</p>
                                    </div>
                                </div>
                                {index < product.reviews.length - 1 && <Separator className="mt-6" />}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">No reviews for this product yet.</p>
                )}
            </div>
          </div>
          
          {/* Right Column - Purchase Card */}
          <div className="md:col-span-1">
             <div className="sticky top-24 bg-background p-6 rounded-lg shadow-lg border">
                <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>

                <div className="mt-6 flex items-center justify-between">
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

                <Button size="lg" className="w-full mt-6" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                </Button>
                <p className="text-sm text-center text-muted-foreground mt-4">{product.stock} servings available</p>
             </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
            <div className="mt-16">
                <h2 className="text-2xl font-bold font-headline mb-6">You Might Also Like</h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
