'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowRight, Copy, Clock, AlertTriangle, CheckCircle2, Phone, Loader2 } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react'; // Suspense ইমপোর্ট করা হলো
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';

// ১. মূল লজিকটি একটি আলাদা কম্পোনেন্টে নিয়ে আসা হলো
function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderNumber = searchParams.get('orderNumber') || '...';
  const name = searchParams.get('name') || 'Guest';
  const amount = searchParams.get('amount') || '0';

  const ADMIN_WHATSAPP = "918240690254"; 

  const message = `Hello Bumba's Kitchen! 👨‍🍳\n\nI have placed a new order. Please confirm it.\n\n🆔 *Order ID:* ${orderNumber}\n👤 *Name:* ${name}\n💰 *Amount:* ₹${amount}\n\nPlease start preparing my food! 🥘`;
  
  const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;

  useEffect(() => {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});
  }, []);

  const copyOrderId = () => {
      navigator.clipboard.writeText(orderNumber);
      toast.success("Order ID copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-6 relative font-sans">
      
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      <div className="w-full max-w-[420px] space-y-8 relative z-10 animate-in slide-in-from-bottom-8 fade-in duration-700">
          
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-t-[6px] border-amber-500 ring-1 ring-black/5">
              
              <div className="flex justify-center items-center gap-3 pt-8 pb-2 px-8">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px] uppercase tracking-wider opacity-60">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Sent
                  </div>
                  <div className="w-10 h-[2px] bg-gray-200 rounded-full"></div>
                  <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[11px] uppercase tracking-wider animate-pulse">
                      <Clock className="h-3.5 w-3.5" /> Verify
                  </div>
              </div>

              <div className="px-8 pb-10 pt-4 text-center">
                  <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-3 leading-tight">
                      Order On Hold! <span className="text-amber-500">⚠️</span>
                  </h1>
                  
                  <div className="text-[15px] leading-relaxed text-gray-500 space-y-1">
                      <p>
                          Thanks <span className="font-semibold text-gray-900">{name.split(' ')[0]}</span>. Your order is placed but needs a quick confirmation.
                      </p>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-3">
                      <div className="bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg flex flex-col items-center">
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Order ID</span>
                          <span className="font-mono font-bold text-gray-800 text-sm">#{orderNumber}</span>
                      </div>
                      <div className="bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg flex flex-col items-center">
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total</span>
                          <span className="font-bold text-gray-800 text-sm">{formatPrice(parseFloat(amount))}</span>
                      </div>
                  </div>
              </div>

              <div className="bg-amber-50/80 p-8 border-t border-amber-100/50 backdrop-blur-sm">
                  
                  <div className="flex items-start gap-3 mb-6 bg-white p-4 rounded-xl border border-amber-200/60 shadow-sm">
                      <div className="bg-amber-100 p-2 rounded-full shrink-0">
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                          <h3 className="font-bold text-amber-950 text-sm">Action Required</h3>
                          <p className="text-xs text-amber-800/80 mt-1 leading-5">
                              We only start cooking after WhatsApp verification to prevent fake orders.
                          </p>
                      </div>
                  </div>

                  <Button 
                      asChild 
                      className="w-full h-14 text-[16px] font-bold rounded-2xl bg-[#25D366] hover:bg-[#1fb655] text-white shadow-lg shadow-green-200/50 hover:shadow-green-300/50 transition-all hover:-translate-y-0.5 active:scale-[0.98] group"
                  >
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                          <MessageCircle className="h-5 w-5 fill-current" />
                          <span>Confirm on WhatsApp</span>
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform opacity-80" />
                      </a>
                  </Button>

                  <div className="mt-7 space-y-2">
                      <div className="flex justify-between items-end">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Auto-cancel timer</span>
                          <span className="text-[10px] font-bold text-red-500 font-mono">10:00</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full w-full animate-[shrink_600s_linear_forwards] origin-left"></div>
                      </div>
                      <style jsx>{`
                          @keyframes shrink { from { width: 100%; } to { width: 0%; } }
                      `}</style>
                  </div>

              </div>
          </div>

          <div className="flex flex-col items-center gap-4">
              <div className="flex justify-center items-center gap-6 text-sm font-medium text-gray-500">
                  <button onClick={copyOrderId} className="flex items-center gap-1.5 hover:text-gray-900 transition-colors group">
                      <Copy className="h-3.5 w-3.5 group-hover:text-primary transition-colors" /> 
                      Copy ID
                  </button>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <button onClick={() => router.push('/account/orders')} className="hover:text-gray-900 transition-colors">
                      View Details
                  </button>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-400 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                  <Phone className="h-3 w-3" />
                  <span>Support: <a href={`tel:${ADMIN_WHATSAPP}`} className="hover:text-gray-600 transition-colors tracking-wide font-mono">{ADMIN_WHATSAPP}</a></span>
              </div>
          </div>

      </div>
    </div>
  );
}

// ২. মেইন পেজ কম্পোনেন্ট এখন Suspense দিয়ে র‍্যাপ করা হলো
export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}