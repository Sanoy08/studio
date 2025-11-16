'use client';

import { notFound } from 'next/navigation';
import { products } from '@/lib/data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Rating } from '@/components/shared/Rating';
import { formatPrice } from '@/lib/utils';
import { useState, use } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import type { Product } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  
  const product = products.find(p => p.slug === use(params).slug);

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    // In a real app, you'd pass the whole product object
    const productToAdd = product as Product;
    for(let i=0; i < quantity; i++){
        addItem(productToAdd);
    }
  };

  return (
    <div className="container py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* Product Image Carousel */}
        <div className="w-full">
            <Carousel className="w-full">
                <CarouselContent>
                    {product.images.map((image, index) => (
                        <CarouselItem key={index}>
                            <div className="aspect-square relative overflow-hidden rounded-lg">
                                <Image
                                    src={image.url}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>
                        </CarouselItem>
                    ))}
                    {/* Add more images if available */}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
            </Carousel>
        </div>

        {/* Product Details */}
        <div>
          <p className="text-sm font-medium text-primary">{product.category.name}</p>
          <h1 className="text-3xl md:text-4xl font-bold font-headline mt-2">{product.name}</h1>
          
          <div className="flex items-center gap-4 mt-4">
            <Rating rating={product.rating} />
            <a href="#reviews" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              ({product.reviewCount} reviews)
            </a>
          </div>

          <p className="text-3xl font-bold mt-6">{formatPrice(product.price)}</p>
          
          <p className="mt-4 text-muted-foreground">{product.description}</p>
          
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => q + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button size="lg" className="flex-grow" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">{product.stock} in stock</p>
        </div>
      </div>

      {/* Reviews Section */}
      <div id="reviews" className="mt-16">
        <h2 className="text-2xl font-bold font-headline mb-6">Customer Reviews</h2>
        <Card>
            <CardContent className="pt-6">
                {product.reviews.length > 0 ? (
                    <div className="space-y-6">
                        {product.reviews.map((review, index) => (
                            <div key={review.id}>
                                <div className="flex items-start gap-4">
                                    <Avatar>
                                        <AvatarImage src={`https://i.pravatar.cc/150?u=${review.author}`} />
                                        <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold">{review.author}</p>
                                                <p className="text-xs text-muted-foreground">{review.date}</p>
                                            </div>
                                            <Rating rating={review.rating} />
                                        </div>
                                        <p className="mt-2 text-sm text-muted-foreground">{review.text}</p>
                                    </div>
                                </div>
                                {index < product.reviews.length - 1 && <Separator className="mt-6" />}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center">No reviews yet. Be the first to write one!</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
