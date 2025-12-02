// src/app/layout.tsx

import type { Metadata, Viewport } from 'next';
import { Poppins, Amarante, Montserrat, Anek_Bangla } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartProvider';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { RealtimeMenuUpdater } from '@/components/providers/RealtimeMenuUpdater';
import { ServiceWorkerRegister } from '@/components/providers/ServiceWorkerRegister'; // সার্ভিস ওয়ার্কার (ক্যাশিং)

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

// নতুন ফন্ট যোগ করুন
const montserrat = Montserrat({ 
  subsets: ['latin'], 
  variable: '--font-montserrat',
  weight: ['900'] // Black weight
});

const anekBangla = Anek_Bangla({ 
  subsets: ['bengali'], 
  variable: '--font-anek-bangla',
  weight: ['500'] // Medium weight
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
      <body className={cn('font-sans antialiased', poppins.variable, amarante.variable , montserrat.variable, anekBangla.variable)}>
          <CartProvider>
            {/* ১. রিয়েল-টাইম মেনু আপডেটার */}
            <RealtimeMenuUpdater />
            
            {/* ২. ইমেজ ক্যাশিং এর জন্য সার্ভিস ওয়ার্কার */}
            <ServiceWorkerRegister />
            
            {/* ৩. মেইন কন্টেন্ট (হেডার/ফুটার ছাড়া) */}
            {children}
            
            <Toaster />
          </CartProvider>
      </body>
    </html>
  );
}