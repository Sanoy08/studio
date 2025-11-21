// src/app/(shop)/account/layout.tsx

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, ShoppingBag, MapPin, Wallet, LogOut } from 'lucide-react'; // Removed Heart
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';
import AccountLoading from './loading';
// import { useUserMock, useMockAuth } from '@/hooks/use-auth-mock'; // DELETE THIS LINE
import { useAuth } from '@/hooks/use-auth'; // ADD THIS LINE

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
  { title: 'Wallet',
    href: '/account/wallet',
    icon: Wallet },
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
  const { user, isLoading, logout } = useAuth(); // UPDATED: useAuth hook
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    try {
      logout(); // UPDATED: use real logout function
      toast.success('Logged out successfully');
      // router.push('/login'); // logout function handles redirect
    } catch (error: any) {
      toast.error('Failed to log out');
    }
  };

  if (isLoading || !user) {
    return (
        <div className="container py-8 md:py-12">
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
    <div className="container py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8 text-center">
          My Account
        </h1>
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="lg:w-1/4">
            <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 overflow-x-auto pb-2 lg:pb-0">
              {sidebarNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-sm flex-shrink-0',
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
                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-sm text-destructive flex-shrink-0 w-full',
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