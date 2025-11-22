// src/components/layout/Header.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader, // Import added
  SheetTitle,  // Import added
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Bell, User, Menu, Phone, LogOut, ShoppingBag, Wallet, MapPin, X, ChevronRight, Sparkles, Instagram, Facebook } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { CartSheet } from '@/components/shop/CartSheet';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/menus', label: 'Menu' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showTopBanner, setShowTopBanner] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSearchClick = () => {
    router.push('/search');
  };

  const handleLogout = () => {
      logout();
      router.push('/login');
  }

  const getInitials = (name: string) => {
      return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <>
        {/* Top Announcement Bar */}
        {showTopBanner && (
            <div className="bg-primary text-primary-foreground py-1.5 px-4 text-center text-xs font-medium relative animate-in slide-in-from-top duration-500">
                <div className="container flex justify-center items-center gap-2">
                    <Sparkles className="h-3 w-3 text-yellow-300 fill-yellow-300 animate-pulse" />
                    <span>Free Delivery on orders above ₹499! Use code <span className="font-bold bg-white/20 px-1 rounded">FREEDEL</span></span>
                </div>
                <button 
                    onClick={() => setShowTopBanner(false)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X className="h-3 w-3" />
                </button>
            </div>
        )}

        <header className={cn(
            "sticky top-0 z-50 w-full transition-all duration-500 border-b",
            isScrolled 
                ? "bg-background/85 backdrop-blur-xl shadow-sm border-border/40 py-0" 
                : "bg-background/60 backdrop-blur-md border-transparent py-2"
        )}>
        <div className="container flex h-16 items-center justify-between gap-4">
            
            {/* Left Side: Logo */}
            <div className="flex items-center gap-3">
                <div className="md:hidden">
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85vw] sm:w-[350px] p-0 flex flex-col border-r-0">
                        
                        {/* ★★★ FIX: Added hidden SheetTitle for accessibility ★★★ */}
                        <SheetHeader className="sr-only">
                            <SheetTitle>Mobile Navigation Menu</SheetTitle>
                        </SheetHeader>

                        {/* Custom Mobile Header */}
                        <div className="p-6 bg-gradient-to-br from-primary/10 via-background to-background border-b">
                            <Logo />
                            {user && (
                                <div className="mt-6 flex items-center gap-3">
                                    <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                                        <AvatarImage src={user.picture} />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">{getInitials(user.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium mb-0.5">{getGreeting()},</p>
                                        <p className="font-bold text-lg leading-none text-foreground">{user.name.split(' ')[0]}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                            <p className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Menu</p>
                            {navLinks.map(link => (
                            <Link key={link.href} href={link.href} className={cn(
                                "flex items-center justify-between py-3 px-4 rounded-xl text-base font-medium transition-all duration-200 group",
                                pathname === link.href 
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                                    : "hover:bg-muted text-foreground/80"
                            )}>
                                <span>{link.label}</span>
                                {pathname === link.href && <ChevronRight className="h-4 w-4 opacity-50" />}
                            </Link>
                            ))}
                        </nav>

                        <div className="p-6 border-t bg-muted/20 space-y-6">
                            <div className="grid grid-cols-2 gap-3">
                                <a href="https://instagram.com" target="_blank" className="flex items-center justify-center gap-2 p-3 bg-background rounded-xl border hover:border-pink-500/50 hover:bg-pink-50 transition-colors group">
                                    <Instagram className="h-4 w-4 text-pink-600 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-medium">Instagram</span>
                                </a>
                                <a href="https://facebook.com" target="_blank" className="flex items-center justify-center gap-2 p-3 bg-background rounded-xl border hover:border-blue-500/50 hover:bg-blue-50 transition-colors group">
                                    <Facebook className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-medium">Facebook</span>
                                </a>
                            </div>

                            {!user && (
                                <Button asChild className="w-full rounded-xl shadow-lg shadow-primary/20 h-12 text-base" size="lg">
                                    <Link href="/login">Login / Sign Up</Link>
                                </Button>
                            )}
                            {user && (
                                <Button onClick={handleLogout} variant="outline" className="w-full rounded-xl h-12 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                                    <LogOut className="mr-2 h-4 w-4" /> Log Out
                                </Button>
                            )}
                        </div>
                    </SheetContent>
                    </Sheet>
                </div>
                <div className="hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={() => router.push('/')}>
                    <Logo />
                </div>
            </div>
            
            {/* Middle: Desktop Navigation */}
            <nav className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-1 bg-background/80 backdrop-blur-md border border-border/50 p-1.5 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
                    {navLinks.map(link => {
                        const isActive = pathname === link.href;
                        return (
                            <Link key={link.href} href={link.href} className={cn(
                                "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 relative group",
                                isActive 
                                    ? "text-primary-foreground bg-primary shadow-sm" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}>
                                {link.label}
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* Right Side: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Search Bar */}
            <div 
                className={cn(
                    "hidden sm:flex relative transition-all duration-300 ease-in-out",
                    isSearchFocused ? "w-[280px] lg:w-[340px]" : "w-[200px] lg:w-[240px]"
                )}
            >
                <div className="relative w-full group">
                    <Search className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300",
                        isSearchFocused ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    <Input
                        readOnly
                        placeholder="Search for dishes..."
                        onClick={handleSearchClick}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        className={cn(
                            "w-full rounded-full pl-10 h-10 text-sm transition-all duration-300 shadow-sm cursor-pointer border-transparent bg-muted/40",
                            "hover:bg-muted/60 hover:border-border/40",
                            "focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-background focus-visible:border-primary/30"
                        )}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                        <span className="text-[10px] font-mono text-muted-foreground/50 border border-border/50 px-1.5 py-0.5 rounded bg-background/50 hidden lg:block">
                            /
                        </span>
                    </div>
                </div>
            </div>

            <Button variant="ghost" size="icon" className="sm:hidden rounded-full hover:bg-primary/10 hover:text-primary" onClick={handleSearchClick}>
                <Search className="h-5 w-5" />
            </Button>

            <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary relative group transition-colors">
                <Link href="/notifications">
                <Bell className="h-5 w-5 transition-transform group-hover:rotate-[20deg]" />
                </Link>
            </Button>

            <CartSheet />

            {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="rounded-full p-0.5 h-10 w-10 ml-1 hover:ring-2 hover:ring-primary/20 hover:bg-transparent transition-all">
                            <Avatar className="h-full w-full border-2 border-background shadow-sm">
                                <AvatarImage src={user.picture} alt={user.name} />
                                <AvatarFallback className="bg-gradient-to-tr from-primary to-primary/70 text-primary-foreground font-bold text-xs">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 mt-2 p-2 rounded-2xl border-border/50 shadow-xl backdrop-blur-xl bg-background/95 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-2 py-3 bg-muted/30 rounded-xl mb-2 border border-border/20">
                            <p className="text-xs font-medium text-primary mb-0.5 flex items-center gap-1">
                                <Sparkles className="h-3 w-3" /> {getGreeting()}
                            </p>
                            <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        
                        <div className="space-y-1">
                            <DropdownMenuItem onClick={() => router.push('/account')} className="cursor-pointer rounded-lg py-2.5 focus:bg-primary/5 focus:text-primary font-medium">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-primary">
                                    <User className="h-4 w-4" />
                                </div>
                                My Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/account/orders')} className="cursor-pointer rounded-lg py-2.5 focus:bg-primary/5 focus:text-primary font-medium">
                                <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center mr-3 text-green-600">
                                    <ShoppingBag className="h-4 w-4" />
                                </div>
                                My Orders
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/account/wallet')} className="cursor-pointer rounded-lg py-2.5 focus:bg-primary/5 focus:text-primary font-medium">
                                <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center mr-3 text-amber-600">
                                    <Wallet className="h-4 w-4" />
                                </div>
                                Wallet
                                <Badge variant="secondary" className="ml-auto text-[10px] h-5 bg-amber-100 text-amber-700 hover:bg-amber-200">New</Badge>
                            </DropdownMenuItem>
                        </div>
                        
                        {user.role === 'admin' && (
                            <>
                                <DropdownMenuSeparator className="my-2 bg-border/50" />
                                <DropdownMenuItem onClick={() => router.push('/admin')} className="cursor-pointer rounded-lg py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 focus:text-amber-900 focus:bg-amber-100 font-bold">
                                    Admin Dashboard
                                </DropdownMenuItem>
                            </>
                        )}
                        
                        <DropdownMenuSeparator className="my-2 bg-border/50" />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-lg py-2.5 text-red-600 focus:text-red-700 focus:bg-red-50 font-medium group">
                            <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center mr-3 text-red-600 group-focus:bg-red-500/20">
                                <LogOut className="h-4 w-4" />
                            </div>
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Button asChild size="sm" className="hidden md:flex rounded-full px-6 ml-2 font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-300 h-10">
                <Link href="/login">Login</Link>
                </Button>
            )}
            </div>
        </div>
        </header>
    </>
  );
}