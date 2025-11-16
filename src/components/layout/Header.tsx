'use client';

import { useState, useEffect } from 'react';
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
import { Search, Bell, User, Menu, Phone, X } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { CartSheet } from '@/components/shop/CartSheet';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    if (isHomePage) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
        setIsScrolled(true);
    }
  }, [isHomePage, pathname]);
  
  const isAuthenticated = false;
  
  const headerClasses = cn(
    "sticky top-0 z-50 w-full transition-all duration-300",
    isHomePage && !isScrolled ? "bg-transparent text-white" : "bg-background/80 backdrop-blur-sm border-b"
  );

  return (
    <header className={headerClasses}>
      <div className="container flex h-16 items-center">
        {/* Left side: Mobile Menu & Logo */}
        <div className="flex items-center gap-2">
            <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className={cn(isHomePage && !isScrolled && "text-white hover:bg-white/10 hover:text-white")}>
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Open Menu</span>
                      </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] bg-card p-0">
                      <SheetHeader className="p-4 border-b">
                        <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                        <div className="flex justify-between items-center">
                          <Logo />
                        </div>
                      </SheetHeader>
                      <div className="p-4">
                      <div className="flex items-center gap-2 bg-muted p-2 rounded-lg text-xs">
                          <Phone className="h-4 w-4"/>
                          <span>+91 9123456789</span>
                      </div>
                      </div>
                      <nav className="flex flex-col p-4 space-y-2">
                      <Link href="/" className="py-2 text-lg font-medium hover:text-primary">Home</Link>
                      <Separator />
                      <Link href="/products" className="py-2 text-lg font-medium hover:text-primary">Menu</Link>
                      <Separator />
                      <Link href="/about" className="py-2 text-lg font-medium hover:text-primary">About Us</Link>
                      <Separator />
                      <Link href="/contact" className="py-2 text-lg font-medium hover:text-primary">Contact</Link>
                      </nav>
                  </SheetContent>
                </Sheet>
            </div>
            <Logo />
        </div>
        
        {/* Centered Search Bar */}
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
            <Input
              type="search"
              placeholder="Search dishes..."
              className="h-10 w-full rounded-full pl-10"
            />
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center justify-end gap-1">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className={cn("hidden md:inline-flex", isHomePage && !isScrolled && "text-white hover:bg-white/10 hover:text-white")}
          >
            <Link href="#">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Link>
          </Button>

          <CartSheet />

          {isAuthenticated ? (
            <Button asChild variant="ghost" size="icon" className={cn(isHomePage && !isScrolled && "text-white hover:bg-white/10 hover:text-white")}>
              <Link href="/admin">
                <User className="h-5 w-5" />
                <span className="sr-only">My Account</span>
              </Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="icon" className={cn(isHomePage && !isScrolled && "text-white hover:bg-white/10 hover:text-white")}>
              <Link href="/login">
                <User className="h-5 w-5" />
                <span className="sr-only">Login</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}