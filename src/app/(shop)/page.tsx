
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Rating } from '@/components/shared/Rating';
import Image from 'next/image';
import Link from 'next/link';
import { products } from '@/lib/data';

const bestSellers = products.slice(0, 4);

export default function HomePage() {
  return (
    <div className="bg-background">
      {/* Hero Section with Search and Image Carousel */}
      <section className="container py-6">
        <Carousel opts={{ loop: true }}>
          <CarouselContent>
            <CarouselItem>
              <div className="relative h-64 overflow-hidden rounded-lg">
                <Image
                  src="https://picsum.photos/seed/offer1/1200/400"
                  alt="Special Offer 1"
                  data-ai-hint="food offer"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <h2 className="text-white text-4xl font-bold">Special Discount Today!</h2>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="relative h-64 overflow-hidden rounded-lg">
                <Image
                  src="https://picsum.photos/seed/offer2/1200/400"
                  alt="Special Offer 2"
                  data-ai-hint="delicious food"
                  fill
                  className="object-cover"
                />
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <h2 className="text-white text-4xl font-bold">Buy One Get One Free</h2>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </section>

      {/* Upcoming Special Offers */}
      <section className="py-12">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-8 font-headline">Upcoming Special Offers</h2>
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
                    <Card className="overflow-hidden">
                      <CardContent className="p-0">
                         <Image
                          src={`https://picsum.photos/seed/special${index}/600/400`}
                          alt={`Special Offer ${index + 1}`}
                          data-ai-hint="indian thali"
                          width={600}
                          height={400}
                          className="w-full h-auto object-cover"
                        />
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
      <section className="py-12 bg-card">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-2 font-headline">Veg Thali Menu</h2>
          <p className="text-muted-foreground mb-6">For 31 May 2024</p>
          <div className="max-w-md mx-auto text-left">
            <ul className="space-y-3 list-disc list-inside">
              <li>ভাত, ডাল (Rice, Dal)</li>
              <li>পাঁচমিশালি সবজি (Mixed Vegetables)</li>
              <li>বেগুন ভাজা (Fried Eggplant)</li>
              <li>আমের চাটনি (Mango Chutney)</li>
              <li>মিষ্টি দই (Sweet Yogurt)</li>
              <li>রসগোল্লা (Rasgulla)</li>
            </ul>
            <p className="text-2xl font-bold text-accent mt-6">Price: ₹250</p>
            <Button asChild size="lg" className="mt-4 w-full">
              <Link href="/products">View Details</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Explore Our Bestsellers */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-8 font-headline">Explore Our Bestsellers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <Card key={product.id} className="flex flex-col overflow-hidden text-center transition-shadow hover:shadow-lg">
                <Link href={`/products/${product.slug}`} className="block relative aspect-square">
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    data-ai-hint="indian food"
                    fill
                    className="object-cover"
                  />
                </Link>
                <CardContent className="p-4 flex-grow flex flex-col">
                  <h3 className="font-semibold text-lg mt-1">{product.name}</h3>
                  <p className="font-bold text-accent text-xl mt-auto pt-2">₹{product.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What Our Customers Say */}
      <section className="py-12 bg-card">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-8 font-headline">What Our Customers Say</h2>
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <Rating rating={5} className="justify-center mb-4" />
                <p className="text-lg italic text-muted-foreground">"The food is very tasty and the price is reasonable. A must try for all food lovers."</p>
                <p className="font-bold mt-4">- Ishita M.</p>
                <p className="text-sm text-muted-foreground">Kolkata</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
