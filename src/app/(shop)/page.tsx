
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Rating } from '@/components/shared/Rating';
import Image from 'next/image';
import Link from 'next/link';
import { products } from '@/lib/data';
import { MobileNav } from '@/components/layout/MobileNav';
import { ProductCard } from '@/components/shop/ProductCard';

const bestSellers = products.slice(0, 8);

export default function HomePage() {
  return (
    <div className="bg-background">
      {/* Hero Section with Search and Image Carousel */}
      <section className="relative -mt-16">
        <Carousel opts={{ loop: true }}>
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
            className="w-full max-w-xs mx-auto"
          >
            <CarouselContent>
              {bestSellers.map((product) => (
                <CarouselItem key={product.id}>
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
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <Rating rating={5} className="justify-center mb-4" />
                <blockquote className="text-lg italic text-muted-foreground">"The food is very tasty and the price is reasonable. A must try for all food lovers."</blockquote>
                <p className="font-bold mt-6">- Ishita M.</p>
                <p className="text-sm text-muted-foreground">Kolkata</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <MobileNav />
    </div>
  );
}
