'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Utensils, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/menus', label: 'Menu', icon: Utensils },
  { href: '/cart', label: 'Cart', icon: ShoppingCart },
  { href: '/account', label: 'Account', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border shadow-t-lg z-50">
      <nav className="flex justify-around items-center h-full">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href) && (link.href !== '/' || pathname === '/');
          return (
            <Link key={link.href} href={link.href} className="flex flex-col items-center justify-center text-center w-full h-full">
              <link.icon className={cn('h-6 w-6 mb-1', isActive ? 'text-primary' : 'text-muted-foreground')} />
              <span className={cn('text-xs font-medium', isActive ? 'text-primary' : 'text-muted-foreground')}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
