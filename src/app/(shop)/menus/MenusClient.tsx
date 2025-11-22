// src/app/(shop)/menus/MenusClient.tsx

'use client';

import { useState } from 'react';
import { ProductCard } from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/button';
import { Drumstick, Sprout, Egg, Beef, UtensilsCrossed, Coffee, Fish, IceCream } from 'lucide-react';
import type { Product } from '@/lib/types';

// ক্যাটাগরি আইকন ম্যাপিং
const categoryIcons: Record<string, any> = {
  All: UtensilsCrossed,
  Veg: Sprout,
  Chicken: Drumstick,
  Egg: Egg,
  Mutton: Beef,
  Fish: Fish,
  Dessert: IceCream,
  Beverages: Coffee
};

const categories = ['All', 'Veg', 'Chicken', 'Mutton', 'Fish', 'Egg', 'Dessert'];

type MenusClientProps = {
  initialProducts: Product[];
};

export function MenusClient({ initialProducts }: MenusClientProps) {
  const [activeCategory, setActiveCategory] = useState('All');

  // ফিল্টারিং লজিক (এখন ক্লায়েন্ট সাইডে হবে, কিন্তু ডেটা আগেই লোড করা আছে)
  const filteredProducts = initialProducts.filter(product => {
    if (activeCategory === 'All') return true;
    return product.category.name === activeCategory;
  });

  return (
    <div className="container py-8">
      {/* Category Filter Section */}
      <div className="mb-8 overflow-x-auto pb-4">
        <div className="flex items-center justify-start sm:justify-center space-x-4 min-w-max px-2">
            {categories.map(category => {
                const Icon = categoryIcons[category] || UtensilsCrossed;
                const isActive = activeCategory === category;
                return (
                    <div key={category} className="text-center">
                        <Button
                            variant={isActive ? 'default' : 'outline'}
                            size="icon"
                            className={`w-16 h-16 rounded-full flex flex-col items-center justify-center gap-1 shadow-sm transition-all hover:scale-105 ${
                                isActive 
                                ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2' 
                                : 'bg-card hover:bg-accent'
                            }`}
                            onClick={() => setActiveCategory(category)}
                        >
                            <Icon className="h-6 w-6" />
                        </Button>
                         <p className={`text-xs mt-2 font-medium transition-colors ${isActive ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                            {category}
                         </p>
                    </div>
                )
            })}
        </div>
      </div>

      {/* Products Grid */}
      <main>
        {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
            </div>
        ) : (
            <div className="text-center py-20">
                <p className="text-xl text-muted-foreground">No items found in this category.</p>
                <Button variant="link" onClick={() => setActiveCategory('All')}>View all items</Button>
            </div>
        )}
      </main>
    </div>
  );
}