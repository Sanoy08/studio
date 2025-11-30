// src/app/layout.tsx

import type { Metadata, Viewport } from 'next';
import { Poppins, Amarante } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartProvider';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { RealtimeMenuUpdater } from '@/components/providers/RealtimeMenuUpdater'; 

// ★★★ নোট: এখান থেকে Header এবং Footer ইমপোর্ট এবং ব্যবহার সরিয়ে ফেলা হয়েছে ★★★
// কারণ এগুলো src/app/(shop)/layout.tsx এ অলরেডি আছে।

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

const amarante = Amarante({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-headline',
  weight: '400',
});

export const metadata: Metadata = {
  title: "Bumba's Kitchen",
  description: 'Authentic Bengali cuisine delivered to your doorstep.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('font-sans antialiased', poppins.variable, amarante.variable)}>
          <CartProvider>
            <RealtimeMenuUpdater />
            
            {/* শুধু চিলড্রেন রেন্ডার হবে, হেডার/ফুটার স্পেসিফিক লেআউট (যেমন shop) থেকে আসবে */}
            {children}
            
            <Toaster />
          </CartProvider>
      </body>
    </html>
  );
}