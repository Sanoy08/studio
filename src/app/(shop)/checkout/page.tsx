// src/app/(shop)/checkout/page.tsx

'use client';

import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// ★★★ FIX: Ticket এবং Coins আইকন এখানে যোগ করা হয়েছে ★★★
import { Lock, ChevronDown, ChevronUp, MapPin, Loader2, Info, Ticket, Coins } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';

// --- Zod Schema ---
const checkoutSchema = z.object({
  name: z.string().min(2, 'Please enter a valid name.'),
  address: z.string().min(10, 'Please enter your primary address (at least 10 characters).'),
  altPhone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number. Please enter a 10-digit Indian number.'),
  deliveryAddress: z.string().optional(),
  preferredDate: z.string().min(1, 'Please select a preferred date.'),
  mealTime: z.enum(['lunch', 'dinner']),
  instructions: z.string().optional(),
  terms: z.boolean().refine(val => val === true, {
    message: "You must agree to the Terms and Conditions."
  }),
  shareLocation: z.boolean().optional(),
});

// --- Helper Components ---
const FloatingLabelInput = ({ field, label, type = 'text' }: any) => (
  <div className="relative">
    <Input 
      type={type} 
      placeholder=" " 
      {...field} 
      value={field.value ?? ''} 
      className="block px-4 pb-2.5 pt-6 w-full text-sm text-foreground bg-background border-muted-foreground/30 rounded-xl border appearance-none focus:outline-none focus:ring-0 focus:border-primary peer h-12 transition-all shadow-sm hover:border-primary/50" 
    />
    <FormLabel className="absolute text-sm text-muted-foreground duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] start-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto pointer-events-none bg-background px-1">
      {label}
    </FormLabel>
  </div>
);

const FloatingLabelTextarea = ({ field, label }: any) => (
  <div className="relative">
    <Textarea 
      placeholder=" " 
      {...field} 
      value={field.value ?? ''}
      className="block px-4 pb-2.5 pt-6 w-full text-sm text-foreground bg-background border-muted-foreground/30 rounded-xl border appearance-none focus:outline-none focus:ring-0 focus:border-primary peer min-h-[100px] transition-all shadow-sm hover:border-primary/50 resize-y" 
    />
    <FormLabel className="absolute text-sm text-muted-foreground duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] start-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto pointer-events-none bg-background px-1">
      {label}
    </FormLabel>
  </div>
);

// --- Main Component ---
export default function CheckoutPage() {
  const { state, totalPrice, itemCount, clearCart, isInitialized, checkoutState } = useCart();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const { couponCode, couponDiscount, useCoins } = checkoutState;

  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [walletBalance, setWalletBalance] = useState(0);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isSuccess, setIsSuccess] = useState(false);

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

  useEffect(() => {
    if (!isLoading && !isInitialized) return;
    
    if (!isLoading && !user) {
      toast.error("Please login to checkout.");
      router.push('/login');
      return;
    }

    if (isInitialized && itemCount === 0 && !isSuccess) {
      router.push('/menus');
    }
  }, [itemCount, user, isLoading, isInitialized, router, isSuccess]);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '', address: '', altPhone: '', deliveryAddress: '',
      preferredDate: '', mealTime: 'lunch', instructions: '', terms: false, shareLocation: false,
    },
  });
  
  const { watch, setValue, reset } = form;
  const primaryAddress = watch('address');
  const [isSameAsAddress, setIsSameAsAddress] = useState(false);

  useEffect(() => {
    const initializeCheckoutData = async () => {
        if (!user) return;
        let savedAddress = '';
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const res = await fetch('/api/user/addresses', { headers: { 'Authorization': `Bearer ${token}` } });
                const data = await res.json();
                if (data.success && Array.isArray(data.addresses)) {
                    const defaultAddr = data.addresses.find((a: any) => a.isDefault);
                    savedAddress = defaultAddr ? defaultAddr.address : (data.addresses[0]?.address || '');
                }
            }
        } catch (error) {}
        
        reset({
            name: user.name || '', 
            address: savedAddress, 
            altPhone: '', 
            deliveryAddress: '',
            preferredDate: '', 
            mealTime: 'lunch', 
            instructions: '', 
            terms: false, 
            shareLocation: false,
        });
    };
    initializeCheckoutData();
  }, [user, reset]);

  useEffect(() => {
    if (isSameAsAddress) setValue('deliveryAddress', primaryAddress);
    else if (watch('deliveryAddress') === primaryAddress) setValue('deliveryAddress', '');
  }, [isSameAsAddress, primaryAddress, setValue, watch]);

  const maxCoinDiscount = totalPrice * 0.5;
  const coinDiscountAmount = useCoins ? Math.min(walletBalance, Math.floor(maxCoinDiscount)) : 0;
  const finalTotal = Math.max(0, totalPrice - couponDiscount - coinDiscountAmount);

  async function onSubmit(values: z.infer<typeof checkoutSchema>) {
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    try {
        const orderPayload = {
            ...values,
            items: state.items,
            subtotal: totalPrice,
            total: finalTotal,
            discount: couponDiscount + coinDiscountAmount,
            couponCode: couponCode,
            useCoins: useCoins,
            orderType: orderType,
            deliveryAddress: orderType === 'delivery' ? (values.deliveryAddress || values.address) : undefined,
        };

        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify(orderPayload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Order placement failed');

        setIsSuccess(true);
        toast.success('Order placed successfully!');
        clearCart();
        
        // Use orderId from API (as identified in diagnosis)
        const orderNum = data.orderId || '0000'; 
        
        const params = new URLSearchParams({
            orderNumber: orderNum,
            name: values.name,
            amount: finalTotal.toString()
        });
        
        router.push(`/checkout/success?${params.toString()}`);

    } catch (error: any) {
        console.error("Checkout Error:", error);
        toast.error(error.message || "Failed to place order. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  }

  if (!isInitialized || isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  
  if (!user) return null;
  if (itemCount === 0 && !isSuccess) return null;

  return (
    <div className="container py-8 md:py-12 max-w-6xl">
      
      {/* Mobile Summary Accordion */}
      <div className="lg:hidden mb-6">
        <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-4 cursor-pointer bg-muted/10" onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">Order Summary</h2>
                {isSummaryExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
              <p className="font-bold text-lg text-primary">{formatPrice(finalTotal)}</p>
            </CardHeader>
            {isSummaryExpanded && (
              <CardContent className="p-4 border-t bg-white">
                  <div className="space-y-3 text-sm">
                      {state.items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                              <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                              <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                      ))}
                      <Separator className="my-2"/>
                      <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatPrice(totalPrice)}</span></div>
                      {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Coupon</span><span>- {formatPrice(couponDiscount)}</span></div>}
                      {coinDiscountAmount > 0 && <div className="flex justify-between text-amber-600"><span>Coins</span><span>- {formatPrice(coinDiscountAmount)}</span></div>}
                  </div>
              </CardContent>
            )}
        </Card>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8 text-center">
        Final Checkout
      </h1>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        
        {/* --- LEFT: FORM SECTION --- */}
        <div className="lg:col-span-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="space-y-4">
                  <h3 className="text-lg font-bold">Contact Info</h3>
                  <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormControl><FloatingLabelInput field={field} label="Full Name" /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="altPhone" render={({ field }) => ( <FormItem><FormControl><FloatingLabelInput field={field} label="Phone Number" type="tel" /></FormControl><FormMessage /></FormItem> )} />
              </div>

              <div className="space-y-4">
                  <h3 className="text-lg font-bold">Delivery Method</h3>
                  <div className="flex gap-4 p-1 bg-muted/20 rounded-2xl border">
                      <Button type="button" onClick={() => setOrderType('delivery')} className={cn("flex-1 h-12 rounded-xl font-medium transition-all", orderType === 'delivery' ? "bg-white text-primary shadow-sm border border-primary/10" : "bg-transparent text-muted-foreground hover:bg-white/50")}>Delivery</Button>
                      <Button type="button" onClick={() => setOrderType('pickup')} className={cn("flex-1 h-12 rounded-xl font-medium transition-all", orderType === 'pickup' ? "bg-white text-primary shadow-sm border border-primary/10" : "bg-transparent text-muted-foreground hover:bg-white/50")}>Pickup</Button>
                  </div>
              </div>

              {orderType === 'delivery' ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <FormField control={form.control} name="address" render={({ field }) => ( <FormItem><FormControl><FloatingLabelInput field={field} label="Primary Address" /></FormControl><FormMessage /></FormItem> )} />
                    
                    <div className="p-4 border rounded-xl bg-gray-50/50 space-y-4">
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl><Checkbox checked={isSameAsAddress} onCheckedChange={() => setIsSameAsAddress(prev => !prev)} /></FormControl>
                            <div className="space-y-1 leading-none"><FormLabel className="font-normal cursor-pointer">Use as delivery address</FormLabel></div>
                        </FormItem>
                        
                        {!isSameAsAddress && (
                            <FormField control={form.control} name="deliveryAddress" render={({ field }) => ( <FormItem><FormControl><FloatingLabelInput field={field} label="Delivery Address" /></FormControl><FormMessage /></FormItem> )} />
                        )}
                    </div>
                </div>
              ) : (
                <div className="p-5 border rounded-xl bg-blue-50/50 animate-in fade-in slide-in-from-top-2 text-center space-y-2 border-blue-100">
                    <p className="font-medium text-lg text-blue-900"><strong>Store Location:</strong> Janai, Garbagan, Hooghly</p>
                    <a href="https://maps.google.com/?q=Janai,Garbagan,Hooghly" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 underline font-medium text-sm transition-colors"><MapPin className="h-4 w-4" /> View on Google Maps</a>
                </div>
              )}

              <div className="space-y-4 pt-2">
                  <h3 className="text-lg font-bold">Preferences</h3>
                  <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="preferredDate" render={({ field }) => ( <FormItem><FormLabel className="text-xs text-muted-foreground ml-1">Date</FormLabel><FormControl><Input type="date" {...field} min={new Date().toISOString().split("T")[0]} className="h-12 rounded-xl bg-background" /></FormControl><FormMessage /></FormItem> )} />
                      <FormField control={form.control} name="mealTime" render={({ field }) => ( <FormItem><FormLabel className="text-xs text-muted-foreground ml-1">Time</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-12 rounded-xl bg-background"><SelectValue placeholder="Time" /></SelectTrigger></FormControl><SelectContent><SelectItem value="lunch">Lunch</SelectItem><SelectItem value="dinner">Dinner</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                  </div>
                  <FormField control={form.control} name="instructions" render={({ field }) => ( <FormItem><FormControl><FloatingLabelTextarea field={field} label="Cooking Instructions (Optional)" /></FormControl><FormMessage /></FormItem> )} />
              </div>

              <FormField control={form.control} name="terms" render={({ field }) => ( 
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-xl bg-muted/10">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <div className="space-y-1 leading-none text-sm">
                          <FormLabel className="font-normal text-muted-foreground">
                              I agree to the <a href="/terms" target="_blank" className="underline text-primary hover:text-primary/80">Terms & Conditions</a> and Refund Policy.
                          </FormLabel>
                          <FormMessage />
                      </div>
                  </FormItem> 
              )} />
              
              <Button type="submit" disabled={isSubmitting} size="lg" className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]">
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Lock className="mr-2 h-5 w-5" />}
                {isSubmitting ? 'Placing Order...' : `Place Order — ${formatPrice(finalTotal)}`}
              </Button>
            </form>
          </Form>
        </div>

        {/* --- RIGHT: ORDER SUMMARY (DESKTOP) --- */}
        <div className="lg:col-span-1 hidden lg:block">
          <Card className="sticky top-24 bg-card shadow-lg border-0 overflow-hidden">
            <CardHeader className="border-b bg-muted/10 pb-4">
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {state.items.map((item) => {
                        const imageSrc = (item.image && item.image.url) ? item.image.url : PLACEHOLDER_IMAGE_URL;
                        return (
                            <div key={item.id} className="flex gap-4 items-center">
                                <div className="relative h-14 w-14 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
                                    <Image src={imageSrc} alt={item.name} fill className="object-cover" />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="font-medium text-sm truncate">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-semibold text-sm whitespace-nowrap">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                        );
                    })}
                </div>
                
                <Separator />

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>{formatPrice(totalPrice)}</span>
                    </div>
                    
                    {couponDiscount > 0 && (
                        <div className="flex justify-between text-green-600 font-medium">
                            <span className="flex items-center gap-1"><Ticket className="h-3 w-3"/> Coupon Applied</span>
                            <span>- {formatPrice(couponDiscount)}</span>
                        </div>
                    )}
                    
                    {coinDiscountAmount > 0 && (
                        <div className="flex justify-between text-amber-600 font-medium">
                            <span className="flex items-center gap-1"><Coins className="h-3 w-3"/> Coins Redeemed</span>
                            <span>- {formatPrice(coinDiscountAmount)}</span>
                        </div>
                    )}
                    
                    <div className="flex justify-between text-muted-foreground">
                        <span>Delivery Fee</span>
                        <span className="text-green-600 font-medium">Free</span>
                    </div>

                    <Separator className="my-2"/>
                    
                    <div className="flex justify-between text-xl font-bold text-primary">
                        <span>Total Payable</span>
                        <span>{formatPrice(finalTotal)}</span>
                    </div>
                    <p className="text-xs text-right text-muted-foreground">Inclusive of all taxes</p>
                </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}