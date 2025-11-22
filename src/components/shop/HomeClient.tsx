// src/components/shop/HomeClient.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { Rating } from '@/components/shared/Rating';
import Image from 'next/image';
import Link from 'next/link';
import { MobileNav } from '@/components/layout/MobileNav';
import { ProductCard } from '@/components/shop/ProductCard';
import Autoplay from "embla-carousel-autoplay";
import { formatPrice } from '@/lib/utils';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';
import type { Product } from '@/lib/types';

// টাইপ ডেফিনিশন
export type HeroSlide = {
  id: string;
  imageUrl: string;
  clickUrl: string;
};

export type Offer = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
};

type HomeClientProps = {
  heroSlides: HeroSlide[];
  offers: Offer[];
  bestsellers: Product[];
};

const testimonials = [
    {
      name: 'Ishita M.',
      location: 'Kolkata',
      rating: 5,
      quote: "The food is very tasty and the price is reasonable. A must try for all food lovers."
    },
    {
      name: 'Rohan G.',
      location: 'Hooghly',
      rating: 4.5,
      quote: "Amazing home-style food! The chicken kosha was simply out of this world. Delivery was on time too."
    },
    {
      name: 'Priya S.',
      location: 'Serampore',
      rating: 5,
      quote: "Bumba's Kitchen is my go-to for weekend meals. The quality is always consistent and the taste is authentic Bengali."
    },
    {
        name: 'Ankit B.',
        location: 'Konnagar',
        rating: 4,
        quote: "I ordered the veg thali and it was wholesome and delicious. Great value for money. Highly recommended!"
    }
];

export function HomeClient({ heroSlides, offers, bestsellers }: HomeClientProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) return
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())
    api.on("select", () => setCurrent(api.selectedScrollSnap()))
  }, [api])

  return (
    <div className="bg-background pb-20 md:pb-0">
      
      {/* Hero Section */}
      <section className="relative -mt-16">
        {heroSlides.length > 0 ? (
          <>
            <Carousel
              setApi={setApi}
              opts={{ loop: true }}
              plugins={[Autoplay({ delay: 5000 })]}
            >
              <CarouselContent>
                {heroSlides.map((slide) => (
                  <CarouselItem key={slide.id}>
                    <Link href={slide.clickUrl} className="block relative h-[50vh] md:h-screen overflow-hidden">
                      <Image
                        src={slide.imageUrl}
                        alt="Hero Slide"
                        fill
                        className="object-cover"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 pb-20 md:pb-8">
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4 hidden md:flex" />
              <CarouselNext className="right-4 hidden md:flex" />
            </Carousel>
            <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={`h-2 rounded-full transition-all shadow-sm ${current === index ? 'w-6 bg-primary' : 'w-2 bg-white/70'}`}
                />
              ))}
            </div>
          </>
        ) : (
           <div className="relative h-[50vh] md:h-screen overflow-hidden bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                  <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">Bumba's Kitchen</h1>
                  <p className="text-xl text-muted-foreground mb-8">Delicious food delivered to you.</p>
                  <Button asChild size="lg"><Link href="/menus">Order Now</Link></Button>
              </div>
           </div>
        )}
      </section>

      {/* Upcoming Special Offers */}
      {offers.length > 0 && (
        <section className="py-12 md:py-24">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12 font-headline">Upcoming Special Offers</h2>
              <Carousel opts={{ align: "start", loop: true }} className="w-full">
                <CarouselContent>
                  {offers.map((offer) => (
                    <CarouselItem key={offer.id} className="md:basis-1/2 lg:basis-1/3">
                      <div className="p-1 h-full">
                        <Card className="overflow-hidden group h-full border-none shadow-md">
                          <CardContent className="p-0 relative aspect-[4/3]">
                            <Image
                              src={offer.imageUrl || PLACEHOLDER_IMAGE_URL}
                              alt={offer.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                                <h3 className="text-2xl font-bold mb-1">{offer.title}</h3>
                                <p className="text-sm text-gray-200 line-clamp-2 mb-2">{offer.description}</p>
                                <p className="text-xl font-bold text-accent">{formatPrice(offer.price)}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
          </div>
        </section>
      )}

      {/* Veg Thali Menu */}
      <section className="py-12 md:py-24 bg-muted/30">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-2 font-headline">Veg Thali Menu</h2>
          <p className="text-muted-foreground mb-8">Today's Special</p>
          <div className="max-w-md mx-auto text-left bg-background p-8 rounded-xl shadow-lg border border-border">
            <ul className="space-y-3 list-disc list-inside text-lg">
              <li>ভাত, ডাল (Rice, Dal)</li>
              <li>পাঁচমিশালি সবজি (Mixed Vegetables)</li>
              <li>বেগুন ভাজা (Fried Eggplant)</li>
              <li>আমের চাটনি (Mango Chutney)</li>
              <li>মিষ্টি দই (Sweet Yogurt)</li>
              <li>রসগোল্লা (Rasgulla)</li>
            </ul>
            <p className="text-3xl font-bold text-accent mt-8 text-center">₹250</p>
            <Button asChild size="lg" className="mt-6 w-full rounded-full">
              <Link href="/menus">View Details</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Explore Our Bestsellers */}
       <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 font-headline">Explore Our Bestsellers</h2>
          {bestsellers.length > 0 ? (
            <Carousel
              opts={{ align: "start", loop: true }}
              className="w-full max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-6xl mx-auto"
            >
              <CarouselContent>
                {bestsellers.map((product) => (
                  <CarouselItem key={product.id} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <div className="p-1 h-full">
                      <ProductCard product={product} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          ) : (
            <p className="text-center text-muted-foreground">No products found.</p>
          )}
        </div>
      </section>

      {/* What Our Customers Say */}
      <section className="py-12 md:py-24 bg-primary/5">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 font-headline">What Our Customers Say</h2>
            <Carousel
                plugins={[Autoplay({ delay: 4000 })]}
                opts={{ align: "start", loop: true }}
                className="w-full max-w-2xl mx-auto"
            >
                <CarouselContent>
                    {testimonials.map((testimonial, index) => (
                        <CarouselItem key={index}>
                            <Card className="border-none shadow-none bg-transparent">
                                <CardContent className="p-8 text-center">
                                    <Rating rating={testimonial.rating} className="justify-center mb-6" />
                                    <blockquote className="text-xl md:text-2xl italic text-foreground/80 font-medium leading-relaxed">"{testimonial.quote}"</blockquote>
                                    <div className="mt-8">
                                        <p className="font-bold text-lg text-primary">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
      </section>
      
      <MobileNav />
    </div>
  );
}