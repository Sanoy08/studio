// src/components/layout/Header.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
// import { useUserMock } from '@/hooks/use-auth-mock'; // DELETE THIS LINE
import { useAuth } from '@/hooks/use-auth'; // ADD THIS LINE

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth(); // UPDATED: useAuth instead of useUserMock
  
  // ... rest of the file remains same ...
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [pathname]);
  
  const headerClasses = cn(
    "sticky top-0 z-50 w-full transition-colors duration-300 bg-background/80 backdrop-blur-sm",
    isScrolled && "border-b"
  );

  return (
    <header className={headerClasses}>
      <div className="container flex h-16 items-center">
        {/* Left side: Mobile Menu & Logo */}
        <div className="flex items-center gap-2 md:gap-4">
            <div className="md:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Open Menu</span>
                      </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] bg-card p-0">
                      <SheetHeader className="p-4 border-b">
                        <div className="flex justify-between items-center">
                          <Logo />
                        </div>
                         <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
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
                        <Link href="/menus" className="py-2 text-lg font-medium hover:text-primary">Menu</Link>
                        <Separator />
                        <Link href="/contact" className="py-2 text-lg font-medium hover:text-primary">Contact</Link>
                      </nav>
                      <div className="absolute bottom-4 left-4 right-4">
                         {user ? (
                            <Button asChild className="w-full">
                                <Link href="/account">My Account</Link>
                            </Button>
                         ) : (
                            <Button asChild className="w-full">
                                <Link href="/login">Login</Link>
                            </Button>
                         )}
                      </div>
                  </SheetContent>
                </Sheet>
            </div>
            <Logo />
        </div>
        
        {/* Centered Search Bar */}
        <div className="flex-1 flex justify-center px-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search dishes..."
              className="w-full rounded-full bg-muted pl-10"
            />
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center justify-end gap-1">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
          >
            <Link href="/notifications">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Link>
          </Button>

          <CartSheet />

          {user ? (
            <Button asChild variant="ghost" size="icon">
              <Link href="/account">
                <User className="h-5 w-5" />
                <span className="sr-only">My Account</span>
              </Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="icon" className="hidden sm:flex">
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