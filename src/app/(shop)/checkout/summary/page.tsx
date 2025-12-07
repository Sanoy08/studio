// src/app/(shop)/checkout/summary/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { Loader2, ArrowRight, Ticket, Coins, Check, ShoppingBag, X, Sparkles, Receipt, Wallet, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';

export default function OrderSummaryPage() {
  const { state, totalPrice, itemCount, isInitialized, setCheckoutData } = useCart();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  
  const [walletBalance, setWalletBalance] = useState(0);
  const [useCoins, setUseCoins] = useState(false);

  // 1. Fetch Wallet Balance
  useEffect(() => {
      const fetchWallet = async () => {
          const token = localStorage.getItem('token');
          if(!token) return;
          try {
              const res = await fetch('/api/wallet', { headers: { 'Authorization': `Bearer ${token}` } });
              const data = await res.json();
              if(data.success) setWalletBalance(data.balance);
          } catch(e) {}
      };
      if (user) fetchWallet();
  }, [user]);

  // 2. Auth Check
  useEffect(() => {
    if (!isLoading && isInitialized) {
        if (!user) {
            toast.error("Please login to continue.");
            router.push('/login?redirect=/checkout/summary');
        } else if (itemCount === 0) {
            router.push('/menus');
        }
    }
  }, [isLoading, isInitialized, user, itemCount, router]);

  // Helper to remove coupon
  const removeCoupon = () => {
      setCouponCode('');
      setCouponDiscount(0);
  };

  // 3. Coupon Handler
  const handleApplyCoupon = async () => {
      if (!couponCode) return;
      setIsApplyingCoupon(true);
      try {
          const res = await fetch('/api/coupons/validate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: couponCode, cartTotal: totalPrice })
          });
          const data = await res.json();
          
          if (data.success) {
              setCouponDiscount(data.coupon.discountAmount);
              if (useCoins) {
                  setUseCoins(false);
                  toast.info("Coins removed. You can use either Coupon OR Coins.");
              }
              toast.success(`YAY! You saved ${formatPrice(data.coupon.discountAmount)}`);
          } else {
              setCouponDiscount(0);
              toast.error(data.error || "Invalid Coupon");
          }
      } catch (error) {
          toast.error("Failed to apply coupon");
      } finally {
          setIsApplyingCoupon(false);
      }
  };

  // 4. Coin Toggle Handler
  const handleCoinToggle = (checked: boolean) => {
      if (checked) {
          if (couponDiscount > 0) {
              removeCoupon();
              toast.info("Coupon removed. You can use either Coupon OR Coins.");
          }
          setUseCoins(true);
      } else {
          setUseCoins(false);
      }
  };

  // 5. Calculation
  const maxCoinDiscount = totalPrice * 0.5;
  const coinDiscountAmount = useCoins ? Math.min(walletBalance, Math.floor(maxCoinDiscount)) : 0;
  const finalTotal = Math.max(0, totalPrice - couponDiscount - coinDiscountAmount);

  // 6. Proceed Handler
  const handleProceed = () => {
      setCheckoutData({
          couponCode: couponDiscount > 0 ? couponCode : '',
          couponDiscount: couponDiscount,
          useCoins: useCoins
      });
      router.push('/checkout');
  };

  if (isLoading || !isInitialized) return <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
        
        {/* Progress Steps */}
        <div className="bg-white border-b py-4 mb-8">
            <div className="container max-w-5xl mx-auto flex items-center justify-center gap-4 text-sm font-medium text-muted-foreground">
                <span className="text-green-600 flex items-center gap-1"><Check className="h-4 w-4" /> Cart</span>
                <span className="w-12 h-px bg-gray-200"></span>
                <span className="text-primary font-bold flex items-center gap-1">2. Summary</span>
                <span className="w-12 h-px bg-gray-200"></span>
                <span>3. Payment</span>
            </div>
        </div>

        <div className="container px-4 md:px-8 max-w-6xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold font-headline mb-8 text-gray-900">Order Summary</h1>
            
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                
                {/* --- LEFT COLUMN: OFFERS & ITEMS --- */}
                <div className="lg:col-span-7 space-y-6">
                    
                    {/* Coin Card */}
                    {walletBalance > 0 && (
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-6 text-white shadow-lg transition-all hover:shadow-xl group">
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white/20 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform"></div>
                            
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-inner border border-white/30">
                                        <Coins className="h-8 w-8 text-white drop-shadow-md" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl drop-shadow-sm flex items-center gap-2">
                                            Bumba Coins
                                            <Sparkles className="h-4 w-4 text-yellow-200 animate-pulse" />
                                        </h3>
                                        <p className="text-yellow-100 text-sm font-medium">Available Balance: {walletBalance}</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={useCoins} 
                                    onCheckedChange={handleCoinToggle}
                                    className="data-[state=checked]:bg-white data-[state=unchecked]:bg-black/20 border-2 border-white/50"
                                />
                            </div>
                            
                            {useCoins && (
                                <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center text-sm font-medium animate-in slide-in-from-top-2">
                                    <span className="text-yellow-50">Savings applied</span>
                                    <span className="text-2xl font-bold text-white drop-shadow-md">- {formatPrice(coinDiscountAmount)}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Coupon Card */}
                    <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 overflow-hidden relative shadow-sm hover:border-primary/30 transition-colors">
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 bg-gray-50 rounded-full border-r border-gray-200"></div>
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 bg-gray-50 rounded-full border-l border-gray-200"></div>

                        <div className="p-6">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                                <Ticket className="h-5 w-5 text-primary" /> Apply Coupon
                            </h3>
                            
                            {couponDiscount > 0 ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between animate-in zoom-in-95">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-green-800 text-sm">'{couponCode}' Applied</p>
                                            <p className="text-xs text-green-600 font-medium">You saved {formatPrice(couponDiscount)}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => { removeCoupon(); toast.info("Coupon removed"); }} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="Enter Coupon Code" 
                                        value={couponCode} 
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        className="h-11 uppercase font-medium tracking-wide bg-gray-50 border-gray-200 focus-visible:ring-primary"
                                    />
                                    <Button 
                                        onClick={handleApplyCoupon} 
                                        disabled={isApplyingCoupon || !couponCode}
                                        className="h-11 px-6 font-bold shadow-sm"
                                    >
                                        {isApplyingCoupon ? <Loader2 className="animate-spin h-4 w-4"/> : "APPLY"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="bg-white rounded-2xl border p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5 text-gray-500" /> Items in Cart
                            </h3>
                            <span className="text-sm text-muted-foreground bg-gray-100 px-2 py-1 rounded-md font-medium">{itemCount} Items</span>
                        </div>
                        
                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                            {state.items.map((item) => {
                                const imageSrc = (item.image && item.image.url) ? item.image.url : PLACEHOLDER_IMAGE_URL;
                                return (
                                    <div key={item.id} className="flex gap-4 items-center group">
                                        <div className="relative h-16 w-16 rounded-xl overflow-hidden border bg-gray-50 flex-shrink-0">
                                            <Image src={imageSrc} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="font-semibold text-sm truncate text-gray-800">{item.name}</p>
                                            <p className="text-xs text-muted-foreground mt-1 font-medium">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                                        </div>
                                        <p className="font-bold text-sm text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: RECEIPT --- */}
                <div className="lg:col-span-5 relative">
                    <div className="lg:sticky lg:top-24">
                        
                        {/* Receipt Container */}
                        <div className="bg-white rounded-t-2xl shadow-xl overflow-hidden border border-b-0 relative">
                            <div className="bg-gray-900 p-5 text-white flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Receipt className="h-5 w-5 text-gray-400" />
                                    <span className="font-bold tracking-wide">BILL SUMMARY</span>
                                </div>
                                {/* ★★★ FIX: এখানে এখন আজকের তারিখ দেখাবে ★★★ */}
                                <div className="text-xs font-mono text-gray-400">Date: {new Date().toLocaleDateString()}</div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Item Total</span>
                                    <span className="font-medium text-gray-900">{formatPrice(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Delivery Fee</span>
                                    <span className="text-green-600 font-bold">FREE</span>
                                </div>

                                {/* Savings */}
                                {(couponDiscount > 0 || (useCoins && coinDiscountAmount > 0)) && (
                                    <div className="bg-green-50 rounded-lg p-3 space-y-2 border border-green-100">
                                        {couponDiscount > 0 && (
                                            <div className="flex justify-between text-green-700 text-sm font-medium">
                                                <span className="flex items-center gap-1.5"><Ticket className="h-3.5 w-3.5"/> Coupon Savings</span>
                                                <span>- {formatPrice(couponDiscount)}</span>
                                            </div>
                                        )}
                                        {useCoins && coinDiscountAmount > 0 && (
                                            <div className="flex justify-between text-amber-700 text-sm font-medium">
                                                <span className="flex items-center gap-1.5"><Coins className="h-3.5 w-3.5"/> Coin Savings</span>
                                                <span>- {formatPrice(coinDiscountAmount)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <Separator className="bg-dashed border-t-2 border-gray-200" />

                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-bold text-gray-900">To Pay</span>
                                    <span className="text-2xl font-extrabold text-primary">{formatPrice(finalTotal)}</span>
                                </div>
                                <p className="text-[10px] text-right text-muted-foreground uppercase tracking-wider font-medium">Inclusive of all taxes</p>
                            </div>
                        </div>

                        {/* Zigzag Bottom Edge */}
                        <div className="relative h-4 w-full bg-white mb-6" style={{ 
                            background: "linear-gradient(45deg, transparent 33.333%, #ffffff 33.333%, #ffffff 66.667%, transparent 66.667%), linear-gradient(-45deg, transparent 33.333%, #ffffff 33.333%, #ffffff 66.667%, transparent 66.667%)",
                            backgroundSize: "20px 40px",
                            backgroundPosition: "0 100%"
                        }}></div>

                        {/* Proceed Button */}
                        <Button 
                            onClick={handleProceed} 
                            size="lg" 
                            className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between px-8"
                        >
                            <span>Proceed to Pay</span>
                            <div className="flex items-center gap-2">
                                <span>{formatPrice(finalTotal)}</span>
                                <ArrowRight className="h-5 w-5" />
                            </div>
                        </Button>

                        <div className="mt-6 flex justify-center items-center gap-6 text-xs font-medium text-gray-400 grayscale opacity-70">
                            <span className="flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5"/> 100% Secure</span>
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5"/> Trusted</span>
                        </div>

                    </div>
                </div>

            </div>
        </div>
        
    </div>
  );
}