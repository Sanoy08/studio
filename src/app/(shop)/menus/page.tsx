// sanoy08/studio/studio-aa52e24a282afd08f6d0f650cbc4061b0fabac53/src/app/(shop)/menus/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/shop/ProductCard';
// import { products } from '@/lib/data'; // REMOVED - will fetch from API
import { Button } from '@/components/ui/button';
import { Drumstick, Sprout, Egg, Beef, UtensilsCrossed } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const categoryIcons = {
  All: UtensilsCrossed,
  Veg: Sprout,
  Chicken: Drumstick,
  Egg: Egg,
  Mutton: Beef,
};

const categories = ['All', 'Veg', 'Chicken', 'Egg', 'Mutton'];

// Fetcher function (could be separated into a hook)
async function fetchProducts(): Promise<Product[]> {
    const res = await fetch('/api/menu', {
        // This ensures data is fetched from the server on demand
        cache: 'no-store', 
    });
    if (!res.ok) {
        // This will be caught by the useEffect's catch block
        throw new Error('Failed to fetch products');
    }
    return res.json();
}

export default function MenusPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This client-side fetch ensures we get fresh data and handle loading state
    fetchProducts()
        .then(data => {
            setProducts(data);
            setIsLoading(false);
        })
        .catch(err => {
            console.error(err);
            setError('Failed to load menu. Please try again later.');
            setIsLoading(false);
        });
  }, []); // Empty dependency array means this runs once on mount

  const filteredProducts = products.filter(product => {
    if (activeCategory === 'All') return true;
    // Filter logic updated to use the Category name from the fetched product
    return product.category.name === activeCategory;
  });

  // --- Loading State UI ---
  if (isLoading) {
    return (
        <div className="container py-8">
            <div className="flex items-center justify-center space-x-4 mb-8">
                {categories.map(category => (
                     <Skeleton key={category} className="w-16 h-16 rounded-full" />
                ))}
            </div>
             <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-[300px]" />
                ))}
             </div>
        </div>
    )
  }
  
  // --- Error State UI ---
  if (error) {
     return (
        <div className="container py-12 text-center">
            <h1 className="text-3xl font-bold text-destructive">Error</h1>
            <p className="text-muted-foreground mt-4">{error}</p>
        </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-2 sm:space-x-4">
            {categories.map(category => {
                const Icon = categoryIcons[category as keyof typeof categoryIcons] || UtensilsCrossed;
                return (
                    <div key={category} className="text-center">
                        <Button
                            variant={activeCategory === category ? 'default' : 'ghost'}
                            size="icon"
                            className={`w-16 h-16 rounded-full flex flex-col items-center justify-center gap-1 shadow-md ${activeCategory === category ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
                            onClick={() => setActiveCategory(category)}
                        >
                            <Icon className="h-6 w-6" />
                        </Button>
                         <p className="text-xs mt-2 font-medium">{category}</p>
                    </div>
                )
            })}
        </div>
      </div>

      <main>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {/* Pagination placeholder remains for now */}
        <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">&lt;</Button>
                <Button variant="default" className="w-8 h-8 p-0">1</Button>
                <Button variant="outline" className="w-8 h-8 p-0">2</Button>
                <Button variant="outline" className="w-8 h-8 p-0">3</Button>
                <Button variant="outline" size="icon">&gt;</Button>
            </div>
        </div>
      </main>
    </div>
  );
}