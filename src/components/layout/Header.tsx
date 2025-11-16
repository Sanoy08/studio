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
  SheetClose,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Search, Bell, User, Menu, ShoppingCart, Phone, X } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { CartSheet } from '@/components/shop/CartSheet';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomePage = pathname === '/';
  const isAuthenticated = false; // Mock authentication state
  
  const headerClasses = cn(
    "sticky top-0 z-40 w-full transition-all duration-300",
    {
      "bg-transparent text-white": isHomePage && !isScrolled,
      "bg-primary text-primary-foreground shadow-md": !isHomePage || isScrolled,
    }
  );

  const inputClasses = cn(
    "h-10 w-full rounded-full pl-10 transition-colors",
    {
        "bg-white/20 placeholder:text-white/80 text-white focus:bg-white/30": isHomePage && !isScrolled,
        "bg-white/90 text-foreground placeholder:text-muted-foreground focus:bg-white": !isHomePage || isScrolled,
    }
  )

  const iconButtonClasses = cn(
    "transition-colors",
    {
        "text-white hover:text-white/80 hover:bg-white/10": isHomePage && !isScrolled,
        "text-primary-foreground hover:text-primary-foreground/80 hover:bg-white/10": !isHomePage || isScrolled
    }
  );

  return (
    <header className={headerClasses}>
      <div className="container flex h-16 items-center">
        {/* Mobile Menu & Logo */}
        <div className="flex items-center gap-2">
            <div className="md:hidden">
                <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className={iconButtonClasses}>
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] bg-primary text-primary-foreground p-0">
                    <SheetHeader className="p-4 border-b border-primary-foreground/20">
                      <div className="flex justify-between items-center">
                            <Logo variant="light" />
                            <SheetClose>
                                <X className="h-6 w-6 text-primary-foreground" />
                            </SheetClose>
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
            </div>
            <Logo variant={isHomePage && !isScrolled ? 'light' : 'dark'} isScrolled={isHomePage && isScrolled} />
        </div>
        
        {/* Centered Search Bar */}
        <div className="flex-1 flex justify-center px-4">
           <div className="relative w-full max-w-md">
            <Input
              type="search"
              placeholder="Search dishes..."
              className={inputClasses}
            />
            <Search className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors", {
                "text-white/80": isHomePage && !isScrolled,
                "text-muted-foreground": !isHomePage || isScrolled
            })} />
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-1">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className={cn("hidden md:inline-flex", iconButtonClasses)}
          >
            <Link href="#">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Link>
          </Button>

          <CartSheet theme={isHomePage && !isScrolled ? 'light' : 'dark'}/>

          {isAuthenticated ? (
            <Button asChild variant="ghost" size="icon" className={iconButtonClasses}>
              <Link href="/admin">
                <User className="h-5 w-5" />
                <span className="sr-only">My Account</span>
              </Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="icon" className={iconButtonClasses}>
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
