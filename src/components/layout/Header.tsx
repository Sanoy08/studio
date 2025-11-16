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
  const isAuthenticated = false; // Mock authentication state
  const pathname = usePathname();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header 
      className="sticky top-0 z-40 w-full bg-cover bg-center text-white"
      style={{backgroundImage: "url('/header-bg.png')"}}
    >
      <div className="container flex h-28 flex-col justify-center gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="text-2xl font-bold text-orange-400" style={{fontFamily: "'Hind Siliguri', sans-serif"}}>মঙ্গল থালি</span>
          </div>
          <div className="flex items-center gap-2">
             <Button asChild variant="ghost" size="icon" className="hover:bg-white/20">
              <Link href="#">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Link>
            </Button>
            {isAuthenticated ? (
              <Button asChild variant="ghost" size="icon" className="hover:bg-white/20">
                <Link href="/admin">
                  <User className="h-5 w-5" />
                  <span className="sr-only">My Account</span>
                </Link>
              </Button>
            ) : (
              <Button asChild variant="ghost" size="icon" className="hover:bg-white/20">
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
        <div className="relative w-full">
            <Input type="search" placeholder="Search for dishes and more..." className="pl-10 h-12 text-base bg-background text-foreground" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
