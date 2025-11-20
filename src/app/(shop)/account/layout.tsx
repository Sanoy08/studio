'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, ShoppingBag, MapPin, Heart, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/account',
    icon: User,
  },
  {
    title: 'Orders',
    href: '/account/orders',
    icon: ShoppingBag,
  },
  {
    title: 'Addresses',
    href: '/account/addresses',
    icon: MapPin,
  },
];

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="container py-12">
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8 text-center">
        My Account
      </h1>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/4">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {sidebarNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-sm',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="truncate">{item.title}</span>
              </Link>
            ))}
             <Separator className="my-4 hidden lg:block" />
             <Link
                href="/login"
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-sm text-destructive',
                   'hover:bg-muted'
                )}
              >
                <LogOut className="h-4 w-4" />
                <span className="truncate">Logout</span>
              </Link>
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
