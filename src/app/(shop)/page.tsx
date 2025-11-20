

'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { Rating } from '@/components/shared/Rating';
import Image from 'next/image';
import Link from 'next/link';
import { products } from '@/lib/data';
import { MobileNav } from '@/components/layout/MobileNav';
import { ProductCard } from '@/components/shop/ProductCard';
import Autoplay from "embla-carousel-autoplay"

const bestSellers = products.slice(0, 8);

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

export default function HomePage() {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )
  
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])


  return (
    <div className="bg-background">
      {/* Hero Section with Search and Image Carousel */}
      <section className="relative -mt-16">
        <Carousel
          setApi={setApi}
          opts={{ loop: true }}
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
        >
          <CarouselContent>
            <CarouselItem>
              <div className="relative h-screen overflow-hidden">
                <Image
                  src="https://picsum.photos/seed/offer1/1200/800"
                  alt="Special Offer 1"
                  data-ai-hint="food offer"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white p-4">
                  
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="relative h-screen overflow-hidden">
                <Image
                  src="https://picsum.photos/seed/offer2/1200/800"
                  alt="Special Offer 2"
                  data-ai-hint="delicious food"
                  fill
                  className="object-cover"
                  priority
                />
                 <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white p-4">
                   <Button asChild size="lg" className="mt-8">
                    <Link href="/menus">Order Now</Link>
                  </Button>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`h-2 rounded-full transition-all ${current === index ? 'w-6 bg-primary' : 'w-2 bg-white/50'}`}
            />
          ))}
        </div>
      </section>

      {/* Upcoming Special Offers */}
      <section className="py-12 md:py-24">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 font-headline">Upcoming Special Offers</h2>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {Array.from({ length: 5 }).map((_, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="overflow-hidden group">
                      <CardContent className="p-0 relative">
                         <Image
                          src={`https://picsum.photos/seed/special${index}/600/400`}
                          alt={`Special Offer ${index + 1}`}
                          data-ai-hint="indian thali"
                          width={600}
                          height={400}
                          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                         <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <p className="text-white text-2xl font-bold">Weekend Special</p>
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

      {/* Veg Thali Menu */}
      <section className="py-12 md:py-24 bg-card">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-2 font-headline">Veg Thali Menu</h2>
          <p className="text-muted-foreground mb-8">For 31 May 2024</p>
          <div className="max-w-md mx-auto text-left bg-background p-8 rounded-lg shadow-lg">
            <ul className="space-y-3 list-disc list-inside text-lg">
              <li>ভাত, ডাল (Rice, Dal)</li>
              <li>পাঁচমিশালি সবজি (Mixed Vegetables)</li>
              <li>বেগুন ভাজা (Fried Eggplant)</li>
              <li>আমের চাটনি (Mango Chutney)</li>
              <li>মিষ্টি দই (Sweet Yogurt)</li>
              <li>রসগোল্লা (Rasgulla)</li>
            </ul>
            <p className="text-3xl font-bold text-accent mt-8 text-center">Price: ₹250</p>
            <Button asChild size="lg" className="mt-6 w-full">
              <Link href="/menus">View Details</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Explore Our Bestsellers */}
       <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 font-headline">Explore Our Bestsellers</h2>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-6xl mx-auto"
          >
            <CarouselContent>
              {bestSellers.map((product) => (
                <CarouselItem key={product.id} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <div className="p-1">
                    <ProductCard product={product} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* What Our Customers Say */}
      <section className="py-12 md:py-24 bg-card">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 font-headline">What Our Customers Say</h2>
            <Carousel
                plugins={[
                  Autoplay({
                    delay: 3000,
                  }),
                ]}
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full max-w-2xl mx-auto embla-fade"
            >
                <CarouselContent>
                    {testimonials.map((testimonial, index) => (
                        <CarouselItem key={index}>
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <Rating rating={testimonial.rating} className="justify-center mb-4" />
                                    <blockquote className="text-lg italic text-muted-foreground">"{testimonial.quote}"</blockquote>
                                    <p className="font-bold mt-6">- {testimonial.name}</p>
                                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
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
