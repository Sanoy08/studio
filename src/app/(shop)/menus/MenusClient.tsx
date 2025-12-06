// src/app/(shop)/menus/MenusClient.tsx

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ProductCard } from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, SlidersHorizontal, X, 
  UtensilsCrossed, ShoppingBag, ArrowUpDown, Leaf, Loader2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

// --- Category Data ---
const CATEGORIES = [
    { name: "All", image: "/Elements/icons/menu-icon.png" }, 
    { name: "Biryani", image: "/Categories/chicken.webp" },
    { name: "Thali", image: "/Categories/rice.webp" },
    { name: "Rolls", image: "/Categories/fried.webp" },
    { name: "Chicken", image: "/Categories/chicken.webp" },
    { name: "Mutton", image: "/Categories/mutton.webp" },
    { name: "Fish", image: "/Categories/fish.webp" },
    { name: "Paneer", image: "/Categories/paneer.webp" },
    { name: "Veg", image: "/Categories/veg.webp" },
    { name: "Egg", image: "/Categories/all.webp" }, 
];

type MenusClientProps = {
  initialProducts: Product[];
};

export function MenusClient({ initialProducts }: MenusClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // States
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [showVegOnly, setShowVegOnly] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // ★ AI Search States ★
  const [aiSearchResults, setAiSearchResults] = useState<Product[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Scroll Detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // URL Sync
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
        const matched = CATEGORIES.find(c => c.name.toLowerCase() === categoryFromUrl.toLowerCase());
        if (matched) setActiveCategory(matched.name);
    } else {
        setActiveCategory('All');
    }
  }, [searchParams]);

  // ★★★ AI Search Logic (Debounced) ★★★
  useEffect(() => {
      // যদি ৩ অক্ষরের কম হয়, তবে লোকাল ফিল্টার ব্যবহার হবে, API কল হবে না
      if (searchQuery.length < 3) {
          setAiSearchResults(null);
          return;
      }

      setIsSearching(true);
      const timeoutId = setTimeout(async () => {
          try {
              const res = await fetch(`/api/search?q=${searchQuery}`);
              const data = await res.json();
              if (data.success) {
                  setAiSearchResults(data.products);
              }
          } catch (error) {
              console.error("Search error:", error);
          } finally {
              setIsSearching(false);
          }
      }, 500); // ৫০০ms অপেক্ষা করবে টাইপ থামানোর পর

      return () => clearTimeout(timeoutId);
  }, [searchQuery]);


  const handleCategoryChange = (category: string) => {
      setActiveCategory(category);
      if (category === 'All') router.push('/menus', { scroll: false });
      else router.push(`/menus?category=${category.toLowerCase()}`, { scroll: false });
  };

  // ★★★ Advanced Filtering Logic ★★★
  const filteredProducts = useMemo(() => {
      // ১. সোর্স নির্ধারণ: যদি AI সার্চ রেজাল্ট থাকে, তবে সেটি ব্যবহার করো, নাহলে ইনিশিয়াল প্রোডাক্ট
      // যদি সার্চ কোয়েরি ৩ অক্ষরের বেশি হয় কিন্তু রেজাল্ট নাল থাকে (মানে লোডিং বা এরর), তবে খালি অ্যারে দেখাবে না, আগেরটাই দেখাবে যতক্ষণ লোড না হয়
      let result = (searchQuery.length >= 3 && aiSearchResults) ? aiSearchResults : initialProducts;

      // ২. ক্যাটাগরি ফিল্টার (সার্চের পরেও ক্যাটাগরি ফিল্টার অ্যাপ্লাই হবে)
      if (activeCategory !== 'All') {
          result = result.filter(p => 
              p.category.name.toLowerCase().includes(activeCategory.toLowerCase()) ||
              (activeCategory === 'Veg' && (p.category.name.toLowerCase().includes('paneer')))
          );
      }

      // ৩. লোকাল সার্চ ফিল্টার (যদি ৩ অক্ষরের কম হয়)
      if (searchQuery && searchQuery.length < 3) {
          const q = searchQuery.toLowerCase();
          result = result.filter(p => 
              p.name.toLowerCase().includes(q) || 
              p.description.toLowerCase().includes(q)
          );
      }

      // ৪. ভেজ ফিল্টার
      if (showVegOnly) {
          result = result.filter(p => 
              p.category.name.toLowerCase().includes('veg') || 
              p.category.name.toLowerCase().includes('paneer') ||
              p.name.toLowerCase().includes('veg')
          );
      }

      // ৫. সর্টিং
      if (sortBy === 'price-low') result = [...result].sort((a, b) => a.price - b.price);
      else if (sortBy === 'price-high') result = [...result].sort((a, b) => b.price - a.price);
      else if (sortBy === 'rating') result = [...result].sort((a, b) => b.rating - a.rating);
      
      return result;
  }, [initialProducts, aiSearchResults, activeCategory, searchQuery, sortBy, showVegOnly]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      
      {/* --- HEADER & FILTERS --- */}
      <div className={cn(
          "sticky top-[60px] z-30 bg-background transition-all duration-300 border-b",
          isScrolled ? "shadow-md py-2" : "py-4"
      )}>
          <div className="container space-y-4">
              
              {/* Top Row */}
              <div className="flex gap-3 items-center">
                  <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                          placeholder="Search for dishes (e.g. Spicy Chicken)..." 
                          className="pl-10 bg-muted/30 border-muted-foreground/20 rounded-xl h-11 focus:bg-background transition-all"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {/* লোডিং বা ক্লিয়ার বাটন */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {isSearching ? (
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : searchQuery ? (
                              <button onClick={() => { setSearchQuery(''); setAiSearchResults(null); }} className="text-muted-foreground hover:text-foreground p-1">
                                  <X className="h-4 w-4" />
                              </button>
                          ) : null}
                      </div>
                  </div>
                  
                  {/* Mobile Filter Sheet (UI Same as before) */}
                  <div className="md:hidden">
                      <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-muted-foreground/20">
                                <SlidersHorizontal className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="rounded-t-3xl">
                            <SheetHeader className="text-left mb-6">
                                <SheetTitle>Filters & Sort</SheetTitle>
                                <SheetDescription>Customize your menu view.</SheetDescription>
                            </SheetHeader>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium flex items-center gap-2"><Leaf className="h-4 w-4 text-green-600"/> Veg Only</span>
                                    <div 
                                        className={cn("w-12 h-6 rounded-full p-1 cursor-pointer transition-colors", showVegOnly ? "bg-green-500" : "bg-muted")}
                                        onClick={() => setShowVegOnly(!showVegOnly)}
                                    >
                                        <div className={cn("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", showVegOnly ? "translate-x-6" : "translate-x-0")} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <span className="font-medium">Sort By</span>
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-full h-12 rounded-xl"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="recommended">Recommended</SelectItem>
                                            <SelectItem value="rating">Top Rated</SelectItem>
                                            <SelectItem value="price-low">Price: Low to High</SelectItem>
                                            <SelectItem value="price-high">Price: High to Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button className="w-full h-12 rounded-xl text-lg" onClick={() => document.body.click()}>Apply Filters</Button>
                            </div>
                        </SheetContent>
                      </Sheet>
                  </div>

                  {/* Desktop Filters */}
                  <div className="hidden md:flex gap-3 items-center">
                      <div 
                        className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all select-none", showVegOnly ? "bg-green-50 border-green-200 text-green-700" : "bg-background border-border hover:bg-muted")}
                        onClick={() => setShowVegOnly(!showVegOnly)}
                      >
                          <Leaf className={cn("h-4 w-4", showVegOnly && "fill-current")} />
                          <span className="font-medium text-sm">Veg Only</span>
                      </div>

                      <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-[160px] h-11 rounded-xl border-muted-foreground/20">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                  <ArrowUpDown className="h-4 w-4" />
                                  <span className="text-foreground"><SelectValue /></span>
                              </div>
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="recommended">Recommended</SelectItem>
                              <SelectItem value="rating">Top Rated</SelectItem>
                              <SelectItem value="price-low">Price: Low to High</SelectItem>
                              <SelectItem value="price-high">Price: High to Low</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
              </div>

              {/* Category Slider */}
              <div className="flex gap-4 md:gap-8 overflow-x-auto pb-2 pt-1 scrollbar-hide mask-fade-right">
                  {CATEGORIES.map((cat, idx) => {
                      const isActive = activeCategory === cat.name;
                      return (
                          <button
                              key={idx}
                              onClick={() => handleCategoryChange(cat.name)}
                              className={cn(
                                  "flex flex-col items-center gap-1.5 min-w-[70px] group transition-all duration-300 p-1 rounded-xl",
                                  isActive ? "scale-105" : "hover:bg-muted/50"
                              )}
                          >
                              <div className={cn(
                                  "relative h-12 w-12 rounded-full overflow-hidden border-2 transition-all",
                                  isActive ? "border-primary shadow-md ring-2 ring-primary/20" : "border-transparent group-hover:border-muted-foreground/30"
                              )}>
                                  <Image 
                                    src={cat.image} 
                                    alt={cat.name} 
                                    fill 
                                    className="object-cover" 
                                    unoptimized={true}
                                  />
                              </div>
                              <span className={cn(
                                  "text-xs font-bold transition-colors",
                                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                              )}>
                                  {cat.name}
                              </span>
                          </button>
                      )
                  })}
              </div>
          </div>
      </div>

      {/* --- PRODUCTS GRID --- */}
      <div className="container py-8 min-h-[60vh]">
        {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in zoom-in duration-300">
                <div className="h-40 w-40 bg-muted/30 rounded-full flex items-center justify-center relative">
                    <UtensilsCrossed className="h-16 w-16 text-muted-foreground/30" />
                    <Search className="h-8 w-8 text-primary absolute bottom-8 right-8 bg-white rounded-full p-1 shadow-md" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">No items found!</h2>
                    <p className="text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
                        We couldn't find any dishes matching your filters. Try changing the category or search term.
                    </p>
                </div>
                <Button 
                    onClick={() => { setActiveCategory('All'); setSearchQuery(''); setShowVegOnly(false); setAiSearchResults(null); }} 
                    className="rounded-full px-8 shadow-lg shadow-primary/20"
                >
                    Clear All Filters
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}