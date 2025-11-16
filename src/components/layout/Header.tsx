'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Search, Bell, User, ShoppingCart } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { CartSheet } from '@/components/shop/CartSheet';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAuthenticated = false; // Mock authentication state
  const pathname = usePathname();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20); // Trigger after scrolling 20px
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-colors duration-300 ease-in-out',
        scrolled ? 'bg-background/95 shadow-md backdrop-blur-sm' : 'bg-transparent'
      )}
    >
      {/* This container sets a fixed height to prevent layout shifts during animation */}
      <div className={cn(
          "container flex flex-col justify-center transition-all duration-300 ease-in-out",
          scrolled ? "h-16" : "h-32"
        )}>
        {/* Top bar with Logo and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo scrolled={scrolled} />
          </div>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className={cn(
                'hover:bg-white/20',
                scrolled ? 'text-foreground hover:bg-accent' : 'text-white'
              )}
            >
              <Link href="#">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Link>
            </Button>
            {isAuthenticated ? (
              <Button
                asChild
                variant="ghost"
                size="icon"
                className={cn(
                  'hover:bg-white/20',
                  scrolled ? 'text-foreground hover:bg-accent' : 'text-white'
                )}
              >
                <Link href="/admin">
                  <User className="h-5 w-5" />
                  <span className="sr-only">My Account</span>
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                variant="ghost"
                size="icon"
                className={cn(
                  'hover:bg-white/20',
                  scrolled ? 'text-foreground hover:bg-accent' : 'text-white'
                )}
              >
                <Link href="/login">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Login</span>
                </Link>
              </Button>
            )}
            <div className="hidden md:block">
              <CartSheet scrolled={scrolled} />
            </div>
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className={cn(scrolled ? 'text-foreground' : 'text-white')}>
                  <ShoppingCart className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-4">
                  <Link href="/" className="block py-2" onClick={closeMobileMenu}>Home</Link>
                  <Link href="/products" className="block py-2" onClick={closeMobileMenu}>Products</Link>
                  <Link href="/about" className="block py-2" onClick={closeMobileMenu}>About</Link>
                  <Link href="/contact" className="block py-2" onClick={closeMobileMenu}>Contact</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        {/* Search Bar - Animates with transform and opacity */}
        <div
          className={cn(
            'relative w-full transition-all duration-300 ease-in-out',
            scrolled
              ? 'h-0 opacity-0 -translate-y-4 pointer-events-none'
              : 'h-12 opacity-100 translate-y-0 mt-4'
          )}
        >
          <Input
            type="search"
            placeholder="Search for dishes and more..."
            className="pl-10 h-12 text-base bg-background text-foreground"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
