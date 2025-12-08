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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, Bell, User, Menu, LogOut, ShoppingBag, 
  Wallet, X, ChevronRight, Sparkles, 
  Instagram, Facebook, Heart, Settings, UtensilsCrossed
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { CartSheet } from '@/components/shop/CartSheet';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';

const navLinks = [
  { href: '/', label: 'Home', icon: Sparkles },
  { href: '/menus', label: 'Menu', icon: UtensilsCrossed },
  { href: '/contact', label: 'Contact', icon: User },
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
      // Small threshold to prevent jitter
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
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
       

        <header className={cn(
            "sticky top-0 z-50 w-full transition-all duration-500 ease-in-out border-b",
            isScrolled 
                ? "bg-background/80 backdrop-blur-xl shadow-sm border-border/60 py-1" 
                : "bg-background/0 border-transparent py-3"
        )}>
        <div className="container flex h-14 sm:h-16 items-center justify-between gap-4">
            
            {/* Left Side: Mobile Menu & Logo */}
            <div className="flex items-center gap-3">
                <div className="md:hidden">
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors -ml-2">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85vw] sm:w-[380px] p-0 flex flex-col border-r-0 gap-0">
                        <SheetHeader className="sr-only">
                            <SheetTitle>Navigation</SheetTitle>
                        </SheetHeader>

                        {/* Mobile Header Profile Section */}
                        <div className="relative overflow-hidden p-6 pb-8 bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                            
                            <div className="relative z-10">
                                <div className="text-white mb-6 brightness-200">
                                    <Logo />
                                </div>
                                
                                {user ? (
                                    <div className="flex items-center gap-4 animate-in slide-in-from-left duration-500">
                                        <Avatar className="h-14 w-14 border-2 border-white/30 shadow-xl">
                                            <AvatarImage src={user.picture} />
                                            <AvatarFallback className="bg-white/20 text-white font-bold text-lg backdrop-blur-sm">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                            <p className="text-xs text-white/80 font-medium">{getGreeting()},</p>
                                            <p className="font-bold text-xl leading-none tracking-tight">{user.name.split(' ')[0]}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-bold">Hungry? 😋</h3>
                                        <p className="text-white/80 text-sm">Log in to order delicious food.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Mobile Navigation Links */}
                        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 bg-background">
                            {navLinks.map((link, idx) => {
                                const Icon = link.icon;
                                return (
                                <Link key={link.href} href={link.href} className={cn(
                                    "flex items-center justify-between py-3.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 group border border-transparent",
                                    pathname === link.href 
                                        ? "bg-primary/5 text-primary border-primary/10 shadow-sm" 
                                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <Icon className={cn("h-4 w-4", pathname === link.href ? "text-primary" : "text-muted-foreground")} />
                                        <span>{link.label}</span>
                                    </div>
                                    {pathname === link.href && <ChevronRight className="h-4 w-4 text-primary animate-in fade-in" />}
                                </Link>
                            )})}
                        </nav>

                        {/* Mobile Footer Area */}
                        <div className="p-6 bg-muted/20 border-t space-y-5">
                            <div className="flex gap-3">
                                <a href="https://instagram.com" className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-background rounded-lg border hover:border-pink-500/30 hover:bg-pink-50/50 transition-all text-xs font-medium text-muted-foreground hover:text-pink-600">
                                    <Instagram className="h-4 w-4" /> Instagram
                                </a>
                                <a href="https://facebook.com" className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-background rounded-lg border hover:border-blue-500/30 hover:bg-blue-50/50 transition-all text-xs font-medium text-muted-foreground hover:text-blue-600">
                                    <Facebook className="h-4 w-4" /> Facebook
                                </a>
                            </div>

                            {!user ? (
                                <Button asChild className="w-full rounded-xl shadow-lg shadow-primary/20 h-12 text-base font-semibold" size="lg">
                                    <Link href="/login">Login / Sign Up</Link>
                                </Button>
                            ) : (
                                <Button onClick={handleLogout} variant="destructive" className="w-full rounded-xl h-11 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 shadow-none">
                                    <LogOut className="mr-2 h-4 w-4" /> Log Out
                                </Button>
                            )}
                        </div>
                    </SheetContent>
                    </Sheet>
                </div>
                
                {/* Logo Wrapper */}
                <div 
                    className="hover:scale-105 transition-transform duration-300 cursor-pointer active:scale-95" 
                    onClick={() => router.push('/')}
                >
                    <Logo />
                </div>
            </div>
            
            {/* Middle: Desktop Floating Navigation */}
            <nav className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
                <div className="flex items-center p-1 bg-background/50 backdrop-blur-md border border-border/40 rounded-full shadow-sm ring-1 ring-border/10">
                    {navLinks.map(link => {
                        const isActive = pathname === link.href;
                        return (
                            <Link key={link.href} href={link.href} className={cn(
                                "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 relative group",
                                isActive 
                                    ? "text-primary-foreground" 
                                    : "text-muted-foreground hover:text-foreground"
                            )}>
                                {isActive && (
                                    <span className="absolute inset-0 bg-primary rounded-full shadow-md -z-10 animate-in zoom-in-95 duration-200" />
                                )}
                                <span className="relative z-10">{link.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* Right Side: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Search Bar - Expandable */}
            <div 
                className={cn(
                    "hidden sm:flex relative transition-all duration-300 ease-out",
                    isSearchFocused ? "w-[260px] lg:w-[340px]" : "w-[180px] lg:w-[240px]"
                )}
            >
                <div className="relative w-full group">
                    <Search className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300 z-10",
                        isSearchFocused ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    <Input
                        readOnly
                        placeholder="Search for delicious food..."
                        onClick={handleSearchClick}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        className={cn(
                            "w-full rounded-full pl-10 h-10 text-sm transition-all duration-300 shadow-sm cursor-pointer",
                            "bg-muted/30 border-transparent",
                            "hover:bg-muted/50 hover:border-border/50",
                            "focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-background focus-visible:border-primary/30 focus-visible:w-full"
                        )}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 pointer-events-none">
                        <kbd className="text-[10px] font-mono text-muted-foreground/60 border border-border/50 px-1.5 py-0.5 rounded bg-background/50 shadow-sm">⌘ K</kbd>
                    </div>
                </div>
            </div>

            {/* Mobile Search Icon */}
            <Button variant="ghost" size="icon" className="sm:hidden rounded-full" onClick={handleSearchClick}>
                <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <Button asChild variant="ghost" size="icon" className="rounded-full relative group transition-colors hover:bg-primary/10 hover:text-primary">
                <Link href="/notifications">
                    <Bell className="h-5 w-5 transition-transform group-hover:rotate-[15deg] origin-top" />
                    <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-background animate-pulse" />
                </Link>
            </Button>

            {/* Cart Sheet */}
            <div className="relative">
                <CartSheet />
            </div>

            {/* User Dropdown / Login Button */}
            {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="rounded-full p-0.5 h-10 w-10 ml-1 hover:ring-4 hover:ring-primary/10 transition-all active:scale-95">
                            <Avatar className="h-full w-full border border-border shadow-sm">
                                <AvatarImage src={user.picture} alt={user.name} />
                                <AvatarFallback className="bg-gradient-to-tr from-primary to-indigo-500 text-white font-bold text-xs">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 mt-3 p-2 rounded-2xl border-border/60 shadow-xl backdrop-blur-xl bg-background/95">
                        <div className="px-3 py-3 bg-muted/40 rounded-xl mb-2 border border-border/20">
                            <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1.5">
                                <Sparkles className="h-3 w-3" /> {getGreeting()}
                            </p>
                            <p className="text-sm font-bold text-foreground truncate leading-tight">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        
                        <DropdownMenuGroup className="space-y-1">
                            <DropdownMenuItem onClick={() => router.push('/account')} className="cursor-pointer rounded-lg py-2.5 focus:bg-primary/5 focus:text-primary font-medium">
                                <User className="mr-3 h-4 w-4 text-muted-foreground" />
                                My Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/account/orders')} className="cursor-pointer rounded-lg py-2.5 focus:bg-primary/5 focus:text-primary font-medium">
                                <ShoppingBag className="mr-3 h-4 w-4 text-muted-foreground" />
                                My Orders
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/account/favorites')} className="cursor-pointer rounded-lg py-2.5 focus:bg-primary/5 focus:text-primary font-medium">
                                <Heart className="mr-3 h-4 w-4 text-muted-foreground" />
                                Favorites
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/account/wallet')} className="cursor-pointer rounded-lg py-2.5 focus:bg-primary/5 focus:text-primary font-medium">
                                <Wallet className="mr-3 h-4 w-4 text-muted-foreground" />
                                Wallet
                                <Badge className="ml-auto text-[10px] h-5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 border-0">New</Badge>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        
                        {user.role === 'admin' && (
                            <>
                                <DropdownMenuSeparator className="my-2 bg-border/50" />
                                <DropdownMenuItem onClick={() => router.push('/admin')} className="cursor-pointer rounded-lg py-2.5 bg-amber-50 text-amber-900 focus:bg-amber-100 focus:text-amber-900 font-bold border border-amber-100/50">
                                    <Settings className="mr-3 h-4 w-4 text-amber-600" />
                                    Admin Dashboard
                                </DropdownMenuItem>
                            </>
                        )}
                        
                        <DropdownMenuSeparator className="my-2 bg-border/50" />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-lg py-2.5 text-red-600 focus:text-red-700 focus:bg-red-50 font-medium group transition-colors">
                            <LogOut className="mr-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Button asChild size="sm" className="hidden md:flex rounded-full px-6 ml-2 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 h-10 bg-gradient-to-r from-primary to-primary/90">
                <Link href="/login">Login</Link>
                </Button>
            )}
            </div>
        </div>
        </header>
    </>
  );
}