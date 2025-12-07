// src/app/(shop)/checkout/success/page.tsx

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, MessageCircle, AlertTriangle, ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti'; // (Optional: যদি কনফেটি এফেক্ট চান, না চাইলে এই লাইন বাদ দিন)

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL থেকে ডেটা নেওয়া
  const orderNumber = searchParams.get('orderNumber') || 'New Order';
  const name = searchParams.get('name') || 'Customer';
  const amount = searchParams.get('amount') || '';

  // আপনার হোয়াটসঅ্যাপ নম্বর (91 যুক্ত করবেন)
  const ADMIN_WHATSAPP_NUMBER = "918240690254"; // ★ এখানে আপনার আসল নম্বর দিন

  // হোয়াটসঅ্যাপ মেসেজ জেনারেট করা
  const message = `Hi Bumba's Kitchen, I just placed order #${orderNumber} of ₹${amount}. My name is ${name}. Please confirm my order.`;
  const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  // উইন্ডো সাইজ (কনফেটির জন্য)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Celebration Effect (Optional) */}
      <div className="absolute inset-0 pointer-events-none">
         <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={200} />
      </div>

      <Card className="max-w-md w-full shadow-2xl border-0 relative z-10 overflow-hidden">
        {/* Top Green Banner */}
        <div className="bg-green-600 h-32 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[url('/patterns/circuit-board.svg')] opacity-10"></div>
            <div className="bg-white p-4 rounded-full shadow-lg animate-in zoom-in duration-500">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
        </div>

        <CardContent className="pt-12 pb-8 px-6 text-center space-y-6">
            
            <div className="space-y-2">
                <h1 className="text-2xl font-bold font-headline text-gray-900">Almost There! 🎉</h1>
                <p className="text-muted-foreground">
                    We have received your request for <span className="font-mono font-bold text-gray-800">#{orderNumber}</span>.
                </p>
            </div>

            {/* Warning Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left flex gap-3 animate-pulse">
                <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                <div>
                    <h3 className="font-bold text-amber-800 text-sm">One Final Step!</h3>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                        To avoid fake orders, we require a <strong>WhatsApp Confirmation</strong>. Without this, your order will be cancelled automatically within 10 mins.
                    </p>
                </div>
            </div>

            {/* WhatsApp Button */}
            <Button 
                asChild 
                size="lg" 
                className="w-full h-14 text-lg font-bold rounded-xl bg-[#25D366] hover:bg-[#128C7E] shadow-lg shadow-green-200 transition-transform hover:scale-[1.02]"
            >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-6 w-6" /> Verify on WhatsApp
                </a>
            </Button>

            <div className="pt-4 border-t">
                <Button variant="ghost" className="text-muted-foreground hover:text-primary" onClick={() => router.push('/account/orders')}>
                    View Order Status <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
            </div>

        </CardContent>
      </Card>
    </div>
  );
}