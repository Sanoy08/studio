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
import { Search, Bell, User, ShoppingCart, Menu } from 'lucide-react';
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
  const isHomePage = pathname === '/';

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    if (!isHomePage) {
      setScrolled(true);
      return;
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  if (!isHomePage) {
    return (
      <header className="sticky top-0 z-40 w-full bg-primary text-primary-foreground shadow-md">
        <div className="container flex items-center justify-between h-16">
           <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-4">
                  <Link href="/" className="block py-2" onClick={closeMobileMenu}>Home</Link>
                  <Link href="/products" className="block py-2" onClick={close_mobile_menu}>Products</Link>
                  <Link href="/about" className="block py-2" onClick={closeMobileMenu}>About</Link>
                  <Link href="/contact" className="block py-2" onClick={closeMobileMenu}>Contact</Link>
                </nav>
              </SheetContent>
            </Sheet>

          <div className="flex-1 text-center">
            <Logo variant="light" />
          </div>

          <div className="flex items-center gap-2">
            <CartSheet />
          </div>
        </div>
        <div className="bg-gray-800 text-white text-xs text-center py-1">
            <p>🎉 New menu items available! *T&C Applied*</p>
        </div>
      </header>
    );
  }

  // Homepage Header
  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-300 ease-in-out',
        scrolled ? 'bg-background shadow-md' : 'bg-transparent'
      )}
    >
      <div className={cn(
          "container flex flex-col justify-center transition-all duration-300 ease-in-out h-20",
        )}>
        {/* Top bar with Logo and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className={cn(scrolled ? 'text-foreground' : 'text-white')}>
                  <Menu className="h-6 w-6" />
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
            <CartSheet scrolled={scrolled} />
          </div>
        </div>
        
      </div>
       <div
          className={cn(
            'relative w-full transition-all duration-300 ease-in-out px-4 pb-4',
            scrolled
              ? 'h-0 opacity-0 -translate-y-4 pointer-events-none'
              : 'h-auto opacity-100 translate-y-0'
          )}
        >
          <div className="relative container p-0">
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

function close_mobile_menu() {
  throw new Error('Function not implemented.');
}
