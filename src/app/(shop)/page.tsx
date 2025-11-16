import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/shop/ProductCard';
import { products } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const featuredProducts = products.filter(p => p.featured).slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] w-full">
        <Image 
          src="https://picsum.photos/seed/hero/1600/900" 
          alt="Stylish living room furniture"
          data-ai-hint="living room furniture"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="container relative h-full flex flex-col items-start justify-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold font-headline max-w-2xl">
            Design Your Perfect Space
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-xl text-neutral-200">
            Discover curated furniture and decor that blend style, comfort, and quality.
          </p>
          <Button asChild size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/products">Shop Now</Link>
          </Button>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 sm:py-24">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Featured Collection</h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              Explore our handpicked selection of best-selling and staff-favorite products.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
