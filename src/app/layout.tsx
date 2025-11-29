import type { Metadata, Viewport } from 'next';
import { Poppins, Amarante } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartProvider';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { RealtimeMenuUpdater } from '@/components/providers/RealtimeMenuUpdater'; // ★ ১. ইমপোর্ট যোগ করা হয়েছে

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
  manifest: '/manifest.json', // ★ এটি থাকতে হবে
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('font-sans antialiased', poppins.variable, amarante.variable)}>
        {/* <FirebaseClientProvider> // REMOVED */}
          <CartProvider>
            {/* ★ ২. রিয়েল-টাইম আপডেটার কম্পোনেন্ট যোগ করা হয়েছে */}
            <RealtimeMenuUpdater />
            
            {children}
            <Toaster />
          </CartProvider>
        {/* </FirebaseClientProvider> // REMOVED */}
      </body>
    </html>
  );
}

// ★★★ এই অংশটি (Viewport) যেমন ছিল তেমনই আছে ★★★
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // অ্যাপের মতো ফিলিংস দেওয়ার জন্য জুম বন্ধ করা হলো (অপশনাল)
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};