'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, ShoppingBag, MapPin, Heart, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';
import AccountLoading from './loading';

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
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to log out');
    }
  };

  if (isUserLoading || !user) {
    return (
        <div className="container py-12">
            <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8 text-center">
                My Account
            </h1>
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="lg:w-1/4">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                         <Separator className="my-4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </aside>
                <main className="flex-1">
                    <AccountLoading />
                </main>
            </div>
        </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto">
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
              <button
                  onClick={handleLogout}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-sm text-destructive w-full',
                    'hover:bg-muted'
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="truncate">Logout</span>
                </button>
            </nav>
          </aside>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
