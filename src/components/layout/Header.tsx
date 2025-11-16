'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, Bell, User, Menu } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { CartSheet } from "@/components/shop/CartSheet";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAuthenticated = false; // Mock authentication state
  const pathname = usePathname();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "sticky top-0 z-40 w-full text-white transition-[background-color,box-shadow,backdrop-filter] duration-500 ease-out",
        scrolled ? "bg-background/95 shadow-md backdrop-blur-sm" : "bg-transparent"
      )}
    >
      <div 
        className={cn(
          "container flex flex-col justify-center gap-4 transition-[height] duration-500 ease-out",
          scrolled ? "h-20" : "h-28"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo scrolled={scrolled} />
            <span className={cn(
              "font-bold text-orange-400 transition-[font-size] duration-500 ease-out",
              scrolled ? "text-xl" : "text-2xl"
            )} style={{fontFamily: "'Hind Siliguri', sans-serif"}}>मंगल থালি</span>
          </div>
          <div className="flex items-center gap-2">
             <Button asChild variant="ghost" size="icon" className={cn("hover:bg-white/20", scrolled && "text-foreground hover:bg-accent")}>
              <Link href="#">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Link>
            </Button>
            {isAuthenticated ? (
              <Button asChild variant="ghost" size="icon" className={cn("hover:bg-white/20", scrolled && "text-foreground hover:bg-accent")}>
                <Link href="/admin">
                  <User className="h-5 w-5" />
                  <span className="sr-only">My Account</span>
                </Link>
              </Button>
            ) : (
              <Button asChild variant="ghost" size="icon" className={cn("hover:bg-white/20", scrolled && "text-foreground hover:bg-accent")}>
                <Link href="/login">
                  <User className="h-5 w-5" />
                   <span className="sr-only">Login</span>
                </Link>
              </Button>
            )}
             <div className="md:hidden">
                <CartSheet />
            </div>
          </div>
        </div>
        <div className={cn("relative w-full transition-opacity duration-500 ease-out", scrolled && "opacity-0 pointer-events-none")}>
            <Input type="search" placeholder="Search for dishes and more..." className="pl-10 h-12 text-base bg-background text-foreground" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
