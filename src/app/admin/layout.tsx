// src/app/admin/layout.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  TicketPercent,
  ImageIcon,
  Bell,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/shared/Logo';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from 'lucide-react';

// অ্যাডমিন নেভিগেশন লিংকসমূহ
const adminNavLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Customers', icon: Users },
  { href: '/admin/offers', label: 'Offers', icon: Tag },
  { href: '/admin/coupons', label: 'Coupons', icon: TicketPercent },
  { href: '/admin/hero-slides', label: 'Hero Slides', icon: ImageIcon },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // মোবাইলের জন্য

  // ১. অ্যাডমিন চেক এবং রিডাইরেক্ট
  useEffect(() => {
    if (!isLoading) {
        if (!user) {
            router.push('/login'); // লগইন না থাকলে লগইন পেজে পাঠাবে
        } else if (user.role !== 'admin') {
            router.push('/'); // অ্যাডমিন না হলে হোমপেজে পাঠাবে
        }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-muted/20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
  }

  // ইউজার অ্যাডমিন না হলে কিছুই রেন্ডার করবে না (রিডাইরেক্ট হওয়ার আগে)
  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-muted/10 flex">
      
      {/* ২. সাইডবার (Desktop) */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 border-r bg-background z-50">
        <div className="h-16 flex items-center px-6 border-b">
            <Logo />
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            {adminNavLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                    <Link 
                        key={link.href} 
                        href={link.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                            isActive 
                                ? "bg-primary text-primary-foreground shadow-md" 
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        {link.label}
                    </Link>
                )
            })}
        </div>
        <div className="p-4 border-t bg-muted/10">
            <div className="flex items-center gap-3 mb-4 px-2">
                <Avatar className="h-9 w-9 border">
                    <AvatarImage src={user.picture} />
                    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">Administrator</p>
                </div>
            </div>
            <Button 
                onClick={() => { logout(); router.push('/login'); }} 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            >
                <LogOut className="mr-2 h-4 w-4" /> Log Out
            </Button>
        </div>
      </aside>

      {/* ৩. মোবাইল সাইডবার ওভারলে */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
            <div className="relative w-64 bg-background h-full shadow-xl flex flex-col animate-in slide-in-from-left duration-300">
                <div className="h-16 flex items-center justify-between px-4 border-b">
                    <Logo />
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                    {adminNavLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link 
                                key={link.href} 
                                href={link.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                                    isActive 
                                        ? "bg-primary text-primary-foreground" 
                                        : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {link.label}
                            </Link>
                        )
                    })}
                </div>
                <div className="p-4 border-t">
                    <Button onClick={() => { logout(); router.push('/login'); }} variant="destructive" className="w-full">
                        <LogOut className="mr-2 h-4 w-4" /> Log Out
                    </Button>
                </div>
            </div>
        </div>
      )}

      {/* ৪. মেইন কন্টেন্ট এরিয়া */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
        
        {/* টপ হেডার (মোবাইল টগল এবং টাইটেল) */}
        <header className="h-16 border-b bg-background/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between lg:justify-end">
            <div className="lg:hidden">
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                    <Menu className="h-6 w-6" />
                </Button>
            </div>
            <div className="flex items-center gap-4">
                <Link href="/" target="_blank">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                        Visit Store
                    </Button>
                </Link>
            </div>
        </header>

        {/* পেজ কন্টেন্ট */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
}