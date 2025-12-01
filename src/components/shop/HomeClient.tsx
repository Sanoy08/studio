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
import { Clock, Utensils } from 'lucide-react';

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
  allProducts?: Product[]; 
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

export function HomeClient({ heroSlides, offers, bestsellers, allProducts = [] }: HomeClientProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  
  // ★★★ নতুন লজিক: ফ্ল্যাগ দিয়ে খোঁজা ★★★
  const vegThali = allProducts.find(p => p.featured === false && p.category.name === 'Thali') 
                || allProducts.find(p => p.name.toLowerCase().includes('thali'));
  // নোট: আমাদের API-তে isDailySpecial ফিল্ডটি ক্লায়েন্ট সাইড টাইপে নাও থাকতে পারে, 
  // তবে আমরা ক্যাটাগরি "Thali" দিয়ে সহজেই খুঁজে পেতে পারি যা আমরা API তে সেট করেছি।

  const todayDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    if (!api) return
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())
    api.on("select", () => setCurrent(api.selectedScrollSnap()))
  }, [api])

  const renderDescriptionList = (description: string) => {
      return description.split('\n').map((line, index) => {
          const cleanLine = line.trim().replace(/^[-•]\s*/, '');
          if (!cleanLine) return null;
          return (
            <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1.5 text-xs">●</span>
                <span>{cleanLine}</span>
            </li>
          );
      });
  };

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
                        unoptimized={true}
                      />
                      {/* Slight overlay for better text visibility if needed */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
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
                  className={`h-2 rounded-full transition-all shadow-sm ${current === index ? 'w-6 bg-primary' : 'w-2 bg-white/80'}`}
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
        <section className="py-12 md:py-24 bg-secondary/30">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12 font-headline text-primary">Upcoming Special Offers</h2>
              <Carousel opts={{ align: "start", loop: true }} className="w-full">
                <CarouselContent>
                  {offers.map((offer) => (
                    <CarouselItem key={offer.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
                      <div className="p-1 h-full">
                        <Card className="overflow-hidden group h-full border-none shadow-lg rounded-2xl bg-card">
                          <CardContent className="p-0 relative aspect-[4/3]">
                            <Image
                              src={offer.imageUrl || PLACEHOLDER_IMAGE_URL}
                              alt={offer.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                              unoptimized={true}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 text-white">
                                <h3 className="text-2xl font-bold mb-1 text-yellow-400">{offer.title}</h3>
                                <p className="text-sm text-gray-200 line-clamp-2 mb-3 opacity-90">{offer.description}</p>
                                <p className="text-3xl font-bold text-white">{formatPrice(offer.price)}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 bg-white/80 text-black hover:bg-white" />
                <CarouselNext className="right-2 bg-white/80 text-black hover:bg-white" />
              </Carousel>
          </div>
        </section>
      )}

      {/* ★★★ VEG THALI SECTION (UPDATED STYLE - CLEAN & BRIGHT) ★★★ */}
      {vegThali && (
        <section className="py-16 md:py-24 bg-amber-50/80">
            <div className="container">
                <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-amber-100">
                    
                    {/* Image Side (If available, otherwise show pattern) */}
                    <div className="md:w-2/5 relative h-64 md:h-auto bg-amber-100 min-h-[300px]">
                         <Image 
                            src={vegThali.images && vegThali.images.length > 0 ? vegThali.images[0].url : PLACEHOLDER_IMAGE_URL}
                            alt={vegThali.name}
                            fill
                            className="object-cover"
                            unoptimized={true}
                         />
                    </div>

                    {/* Content Side */}
                    <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-center text-left">
                        <div className="inline-flex items-center gap-2 text-amber-600 text-sm font-bold uppercase tracking-wider mb-2">
                            <Utensils className="h-4 w-4" /> Today's Special
                        </div>
                        
                        <h2 className="text-3xl md:text-4xl font-bold mb-2 font-headline text-gray-900">
                            {vegThali.name}
                        </h2>
                        
                        <div className="flex items-center gap-2 text-muted-foreground mb-6 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>Menu for {todayDate}</span>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8">
                            <ul className="space-y-2 text-base md:text-lg text-gray-700 font-medium">
                                {renderDescriptionList(vegThali.description)}
                            </ul>
                        </div>
                        
                        <div className="flex items-center justify-between gap-4 mt-auto pt-2">
                            <p className="text-3xl md:text-4xl font-bold text-primary">
                                {formatPrice(vegThali.price)}
                            </p>
                            <Button asChild size="lg" className="rounded-full px-8 text-lg shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                                <Link href={`/menus/${vegThali.slug}`}>Order Now</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      )}

      {/* Explore Our Bestsellers */}
       <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 font-headline text-primary">Explore Our Bestsellers</h2>
          {bestsellers.length > 0 ? (
            <Carousel
              opts={{ align: "start", loop: true }}
              className="w-full max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-6xl mx-auto"
            >
              <CarouselContent>
                {bestsellers.map((product) => (
                  <CarouselItem key={product.id} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 pl-4">
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
          <h2 className="text-3xl font-bold text-center mb-12 font-headline text-primary">What Our Customers Say</h2>
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