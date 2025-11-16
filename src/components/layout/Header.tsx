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
import { Logo } from '@/components/layout/Logo';
import { CartSheet } from '@/components/shop/CartSheet';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isAuthenticated = false; // Mock authentication state

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    if (isHomePage) {
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    } else {
        setScrolled(true);
    }
  }, [isHomePage]);

  const headerClass = isHomePage
    ? cn(
        'fixed top-0 z-40 w-full transition-all duration-300 ease-in-out',
        scrolled ? 'bg-primary shadow-md' : 'bg-transparent'
      )
    : 'sticky top-0 z-40 w-full bg-primary text-primary-foreground shadow-md';
    
  const searchBarClass = isHomePage ?
   cn(
    "absolute left-1/2 top-[110px] w-[90%] max-w-2xl -translate-x-1/2 transition-all duration-300 ease-in-out",
    scrolled ? "opacity-0 -translate-y-4 pointer-events-none" : "opacity-100"
   )
   : "relative w-full";


  if (!isHomePage) {
    return (
      <header className="sticky top-0 z-40 w-full bg-primary text-primary-foreground shadow-md">
      <div className="container flex flex-col gap-4 py-3">
        <div className="flex items-center justify-between h-10">
          <Logo scrolled={true} />
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-foreground hover:bg-primary/80 md:hidden"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-primary text-primary-foreground p-0">
                <SheetHeader className="p-4 border-b border-primary-foreground/20">
                  <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                    <div className="flex justify-between items-center">
                        <Logo scrolled={true} />
                        <div className="flex items-center gap-2">
                             <CartSheet scrolled={true} />
                            <SheetClose>
                                <X className="h-6 w-6 text-primary-foreground" />
                            </SheetClose>
                        </div>
                    </div>
                </SheetHeader>
                <div className="p-4">
                  <div className="flex items-center gap-2 bg-white/20 p-2 rounded-lg text-xs">
                    <Phone className="h-4 w-4"/>
                    <span>+91 9123456789</span>
                  </div>
                </div>
                <nav className="flex flex-col p-4 space-y-2">
                  <Link href="/" className="py-2 text-lg font-medium hover:text-accent">Home</Link>
                  <Separator className="bg-primary-foreground/20"/>
                  <Link href="/products" className="py-2 text-lg font-medium hover:text-accent">Menu</Link>
                   <Separator className="bg-primary-foreground/20"/>
                  <Link href="/about" className="py-2 text-lg font-medium hover:text-accent">About Us</Link>
                   <Separator className="bg-primary-foreground/20"/>
                  <Link href="/contact" className="py-2 text-lg font-medium hover:text-accent">Contact</Link>
                </nav>
              </SheetContent>
            </Sheet>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary/80"
            >
              <Link href="#">
                <Bell className="h-6 w-6" />
                <span className="sr-only">Notifications</span>
              </Link>
            </Button>
            <CartSheet scrolled={true} />
            {isAuthenticated ? (
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary/80"
              >
                <Link href="/admin">
                  <User className="h-6 w-6" />
                  <span className="sr-only">My Account</span>
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary/80"
              >
                <Link href="/login">
                  <User className="h-6 w-6" />
                  <span className="sr-only">Login</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
        <div className="relative w-full">
            <Input
              type="search"
              placeholder="Search for dishes and more..."
              className="h-11 w-full rounded-lg bg-white pl-10 text-foreground placeholder:text-muted-foreground"
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
            />
          </div>
      </div>
    </header>
    )
  }

  return (
    <header className={headerClass}>
      <div className="container flex items-center justify-between h-20">
        <Logo scrolled={scrolled} />
        <div className="flex items-center gap-1">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className={cn("hover:bg-white/20", scrolled ? "text-foreground hover:bg-accent" : "text-white")}
          >
            <Link href="#">
              <Bell className="h-5 w-5" />
            </Link>
          </Button>

          <CartSheet scrolled={scrolled}/>

          {isAuthenticated ? (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className={cn("hover:bg-white/20", scrolled ? "text-foreground hover:bg-accent" : "text-white")}
            >
              <Link href="/admin">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          ) : (
             <Button
              asChild
              variant="ghost"
              size="icon"
              className={cn("hover:bg-white/20", scrolled ? "text-foreground hover:bg-accent" : "text-white")}
            >
              <Link href="/login">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
       <div className={searchBarClass}>
            <div className="relative">
              <Input
                type="search"
                placeholder="Search for dishes and more..."
                className="h-12 w-full rounded-lg bg-white pl-12 text-lg"
              />
              <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
    </header>
  );
}
