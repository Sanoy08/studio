// src/app/(shop)/search/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, Loader2, X } from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import { Product } from '@/lib/types';
import { useDebounce } from '@/hooks/use-debounce'; // আমরা নিচে এই হুকটি তৈরি করব
import { Skeleton } from '@/components/ui/skeleton';

// প্লেসহোল্ডার টেক্সট অ্যানিমেশনের জন্য
const PLACEHOLDERS = [
  "Search for 'Biryani'...", 
  "Craving 'Chicken Korma'...", 
  "Try 'Fish Fry'...", 
  "Looking for 'Veg Thali'..."
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // প্লেসহোল্ডার অ্যানিমেশন স্টেট
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // ডিবাউন্সড কুয়েরি (টাইপ করার ৫০০ms পর সার্চ কল হবে)
  const debouncedQuery = useDebounce(query, 500);

  // প্লেসহোল্ডার চেঞ্জ ইফেক্ট
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // সার্চ ফাংশন
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      if (data.success) {
        setResults(data.products);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search failed", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ডিবাউন্স ইফেক্ট
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, [debouncedQuery, performSearch]);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="container py-8 min-h-screen">
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-center mb-6 font-headline">Find Your Meal</h1>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={PLACEHOLDERS[placeholderIndex]}
            className="pl-10 pr-10 h-12 text-lg rounded-full shadow-sm border-primary/20 focus-visible:ring-primary"
            autoFocus
          />
          {query && (
            <button 
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="mt-8">
        {isLoading ? (
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-80 w-full rounded-lg" />)}
           </div>
        ) : hasSearched ? (
            results.length > 0 ? (
                <div>
                    <p className="text-muted-foreground mb-4">Found {results.length} result{results.length > 1 ? 's' : ''}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {results.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-xl font-medium text-muted-foreground">No dishes found for "{query}"</p>
                    <p className="text-sm text-muted-foreground mt-2">Try searching for "Chicken", "Veg", or specific dish names.</p>
                </div>
            )
        ) : (
            // Initial State (Show Trending or recent logic here if needed)
            <div className="text-center py-12 opacity-50">
                <SearchIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <p>Start typing to search our delicious menu...</p>
            </div>
        )}
      </div>
    </div>
  );
}