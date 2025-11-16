'use client';

import { useState } from 'react';
import { ProductCard } from '@/components/shop/ProductCard';
import { products } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Drumstick, Sprout, Egg, Beef, UtensilsCrossed } from 'lucide-react';

const categoryIcons = {
  All: UtensilsCrossed,
  Veg: Sprout,
  Chicken: Drumstick,
  Egg: Egg,
  Mutton: Beef,
};

const categories = ['All', 'Veg', 'Chicken', 'Egg', 'Mutton'];

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProducts = products.filter(product => {
    if (activeCategory === 'All') return true;
    // This is a mock filter. In a real app, products would have a category field to filter by.
    if (activeCategory === 'Veg') return product.category.name === 'Decor' || product.category.name === 'Lamps';
    if (activeCategory === 'Chicken') return product.category.name === 'Chairs' || product.category.name === 'Sofas';
    return true;
  });

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
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
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
