'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Search, Bell, User, Menu, ShoppingCart, Phone, X } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { CartSheet } from '@/components/shop/CartSheet';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAuthenticated = false; // Mock authentication state
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-colors duration-300 ease-in-out',
        scrolled || !isHomePage ? 'bg-primary text-primary-foreground shadow-md' : 'bg-transparent'
      )}
    >
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'md:hidden',
                  scrolled || !isHomePage
                    ? 'text-primary-foreground hover:bg-primary/80'
                    : 'text-white hover:bg-white/20'
                )}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-full max-w-sm bg-card text-card-foreground">
              <SheetHeader className="flex flex-row items-center justify-between p-4 border-b">
                 <Logo />
                <SheetClose asChild>
                  <Button variant="ghost" size="icon">
                      <X className="h-6 w-6" />
                  </Button>
                </SheetClose>
              </SheetHeader>
              <nav className="mt-4 text-lg font-medium">
                <Link href="/" className="block py-3 px-6 hover:bg-muted" onClick={closeMobileMenu}>Home</Link>
                <Link href="/products" className="block py-3 px-6 hover:bg-muted" onClick={closeMobileMenu}>Menu</Link>
                <Link href="/cart" className="block py-3 px-6 hover:bg-muted" onClick={closeMobileMenu}>Cart</Link>
                <Link href="/contact" className="block py-3 px-6 hover:bg-muted" onClick={closeMobileMenu}>Contact</Link>
                <Separator className="my-2" />
                <Link href="/login" className="block py-3 px-6 hover:bg-muted" onClick={closeMobileMenu}>My Account</Link>
                <Link href="#" className="block py-3 px-6 hover:bg-muted" onClick={closeMobileMenu}>Logout</Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="hidden md:block">
             <Logo scrolled={scrolled} variant={scrolled || !isHomePage ? 'dark' : 'light'} />
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link href="/" className={cn('transition-colors', scrolled || !isHomePage ? 'text-primary-foreground hover:text-primary-foreground/80' : 'text-white hover:text-white/80')}>Home</Link>
            <Link href="/products" className={cn('transition-colors', scrolled || !isHomePage ? 'text-primary-foreground hover:text-primary-foreground/80' : 'text-white hover:text-white/80')}>Menu</Link>
            <Link href="/about" className={cn('transition-colors', scrolled || !isHomePage ? 'text-primary-foreground hover:text-primary-foreground/80' : 'text-white hover:text-white/80')}>About</Link>
            <Link href="/contact" className={cn('transition-colors', scrolled || !isHomePage ? 'text-primary-foreground hover:text-primary-foreground/80' : 'text-white hover:text-white/80')}>Contact</Link>
        </nav>
        
        <div className="flex items-center gap-2">
            <div className="hidden md:block relative w-48">
              <Input
                type="search"
                placeholder="Search..."
                className={cn('pl-10 h-9 transition-all duration-300', scrolled || !isHomePage ? 'bg-primary/80 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/70 focus:bg-white focus:text-foreground focus:placeholder:text-muted-foreground' : 'bg-white/20 text-white placeholder:text-white/70 border-white/30 focus:bg-white focus:text-foreground focus:placeholder:text-muted-foreground')}
              />
              <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4', scrolled || !isHomePage ? 'text-primary-foreground/70' : 'text-white/70')} />
            </div>

            <Button
              asChild
              variant="ghost"
              size="icon"
              className={cn('hidden md:inline-flex', scrolled || !isHomePage ? 'text-primary-foreground hover:bg-primary/80' : 'text-white hover:bg-white/20')}
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
                className={cn('hidden md:inline-flex', scrolled || !isHomePage ? 'text-primary-foreground hover:bg-primary/80' : 'text-white hover:bg-white/20')}
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
                className={cn('hidden md:inline-flex', scrolled || !isHomePage ? 'text-primary-foreground hover:bg-primary/80' : 'text-white hover:bg-white/20')}
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
    </header>
  );
}
