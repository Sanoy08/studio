import { ProductCard } from '@/components/shop/ProductCard';
import { products, categories } from '@/lib/data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function ProductsPage() {
  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">All Products</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
          Browse our entire collection of high-quality furniture and home decor.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20">
            <div className="mb-6 relative">
              <Input type="search" placeholder="Search..." className="pl-10" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Accordion type="multiple" defaultValue={['category', 'price']} className="w-full">
              <AccordionItem value="category">
                <AccordionTrigger className="text-lg font-semibold">Category</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-2">
                    {categories.map(category => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox id={category.id} />
                        <label
                          htmlFor={category.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="price">
                <AccordionTrigger className="text-lg font-semibold">Price Range</AccordionTrigger>
                <AccordionContent>
                  <div className="px-1">
                    <Slider
                        defaultValue={[0, 1500]}
                        max={3000}
                        step={50}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>$0</span>
                        <span>$3000</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="rating">
                <AccordionTrigger className="text-lg font-semibold">Rating</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-2">
                    {[4, 3, 2, 1].map(rating => (
                        <div key={rating} className="flex items-center space-x-2">
                            <Checkbox id={`rating-${rating}`} />
                            <label htmlFor={`rating-${rating}`} className="text-sm font-medium">
                                {rating} stars & up
                            </label>
                        </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button className="w-full mt-6">Apply Filters</Button>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Button variant="outline">Load More</Button>
          </div>
        </main>
      </div>
    </div>
  );
}
