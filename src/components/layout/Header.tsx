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
  const isAuthenticated = false; // Mock authentication state

  return (
    <header className="sticky top-0 z-40 w-full bg-primary text-primary-foreground shadow-md">
      <div className="container flex flex-col gap-4 py-3">
        <div className="flex items-center justify-between h-10">
          <Logo />
          <div className="flex items-center gap-2">
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
  );
}
