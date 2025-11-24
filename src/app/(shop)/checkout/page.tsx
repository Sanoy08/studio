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
import { Lock, ChevronDown, ChevronUp, MapPin, Tag, Loader2, X } from 'lucide-react';
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

// --- হেল্পার কম্পোনেন্ট (ফাংশনের বাইরে) ---

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

// ★★★ FIX: OrderSummaryContent এখন ফাংশনের বাইরে ★★★
interface OrderSummaryProps {
    items: any[];
    totalPrice: number;
    couponCode: string;
    setCouponCode: (code: string) => void;
    isApplyingCoupon: boolean;
    handleApplyCoupon: () => void;
    appliedCoupon: any;
    handleRemoveCoupon: () => void;
    discountAmount: number;
    finalTotal: number;
}

const OrderSummaryContent = ({
    items,
    totalPrice,
    couponCode,
    setCouponCode,
    isApplyingCoupon,
    handleApplyCoupon,
    appliedCoupon,
    handleRemoveCoupon,
    discountAmount,
    finalTotal
}: OrderSummaryProps) => (
    <>
      <h3 className="font-bold text-lg mb-4">Your Order</h3>
       <div className="space-y-5">
        {items.map((item) => {
            const imageSrc = (item.image && item.image.url && item.image.url.trim() !== '') 
                ? item.image.url 
                : PLACEHOLDER_IMAGE_URL;

            return (
                <div key={item.id} className="flex items-center gap-4 relative">
                    <div className="relative h-16 w-16">
                        <div className="relative h-full w-full rounded-md overflow-hidden border bg-muted">
                            <Image src={imageSrc} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center z-10 shadow-sm border border-background">
                            {item.quantity}
                        </div>
                    </div>

                    <div className="flex-grow">
                        <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                    </div>
                    <p className="font-semibold text-sm whitespace-nowrap">{formatPrice(item.price * item.quantity)}</p>
                </div>
            );
        })}
      </div>
      <Separator className="my-4" />
      
      {/* Coupon Section */}
      <div className="mb-4">
        {!appliedCoupon ? (
            <div className="flex gap-2">
                <Input 
                    placeholder="Enter Coupon Code" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="h-10 border-dashed"
                />
                <Button onClick={handleApplyCoupon} disabled={isApplyingCoupon || !couponCode} variant="secondary">
                    {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                </Button>
            </div>
        ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center text-sm text-green-700">
                <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span>Code <strong>{appliedCoupon.code}</strong> applied!</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleRemoveCoupon} className="h-6 w-6 hover:bg-green-100 text-green-800">
                    <X className="h-3 w-3" />
                </Button>
            </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <p className="text-muted-foreground">Subtotal</p>
          <p>{formatPrice(totalPrice)}</p>
        </div>
        {appliedCoupon && (
            <div className="flex justify-between text-green-600 font-medium">
                <p>Discount</p>
                <p>- {formatPrice(discountAmount)}</p>
            </div>
        )}
      </div>
      <Separator className="my-4" />
      <div className="flex justify-between font-bold text-lg">
        <p>Total</p>
        <p className="text-primary">{formatPrice(finalTotal)}</p>
      </div>
    </>
);

// -------------------------------------------------------------------

export default function CheckoutPage() {
  const { state, totalPrice, itemCount, clearCart, isInitialized } = useCart();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    if (!isLoading && !isInitialized) return;
    if (!isLoading && !user) {
      toast.error("Please login to checkout.");
      router.push('/login');
    }
    if (isInitialized && itemCount === 0) {
      router.push('/menus');
    }
  }, [itemCount, user, isLoading, isInitialized, router]);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      address: '',
      altPhone: '',
      deliveryAddress: '',
      preferredDate: '',
      mealTime: 'lunch',
      instructions: '',
      terms: false,
      shareLocation: false,
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
                const res = await fetch('/api/user/addresses', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success && Array.isArray(data.addresses)) {
                    const defaultAddr = data.addresses.find((a: any) => a.isDefault);
                    if (defaultAddr) {
                        savedAddress = defaultAddr.address;
                    } else if (data.addresses.length > 0) {
                        savedAddress = data.addresses[0].address;
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
        }
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
    if (isSameAsAddress) {
        setValue('deliveryAddress', primaryAddress);
    } else {
        if (watch('deliveryAddress') === primaryAddress) {
            setValue('deliveryAddress', '');
        }
    }
  }, [isSameAsAddress, primaryAddress, setValue, watch]);

  const handleApplyCoupon = async () => {
      if (!couponCode) {
          toast.error("Please enter a coupon code");
          return;
      }
      setIsApplyingCoupon(true);
      try {
          const res = await fetch('/api/coupons/validate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: couponCode, cartTotal: totalPrice })
          });
          const data = await res.json();
          
          if (data.success) {
              setAppliedCoupon(data.coupon);
              setDiscountAmount(data.coupon.discountAmount);
              toast.success(data.message);
          } else {
              setAppliedCoupon(null);
              setDiscountAmount(0);
              toast.error(data.error);
          }
      } catch (error) {
          toast.error("Failed to apply coupon");
      } finally {
          setIsApplyingCoupon(false);
      }
  };

  const handleRemoveCoupon = () => {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponCode('');
      toast.info("Coupon removed");
  };

  async function onSubmit(values: z.infer<typeof checkoutSchema>) {
    const token = localStorage.getItem('token');
    
    try {
        const orderPayload = {
            ...values,
            items: state.items,
            subtotal: totalPrice,
            discount: discountAmount,
            couponCode: appliedCoupon ? appliedCoupon.code : null,
            total: totalPrice - discountAmount,
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

        toast.success('Order placed successfully!');
        clearCart();
        router.push('/account/orders');

    } catch (error: any) {
        console.error("Checkout Error:", error);
        toast.error(error.message || "Failed to place order. Please try again.");
    }
  }

  if (!isInitialized || isLoading) {
    return (
        <div className="container py-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading checkout...</p>
        </div>
    );
  }
  
  if (!user || itemCount === 0) return null;
  
  const finalTotal = totalPrice - discountAmount;

  return (
    <div className="container py-8 md:py-12">
      <div className="lg:hidden mb-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4 cursor-pointer" onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Order Summary</h2>
                {isSummaryExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
              <p className="font-bold text-lg">{formatPrice(finalTotal)}</p>
            </CardHeader>
            {isSummaryExpanded && (
              <CardContent className="p-4 border-t">
                  {/* Props pass করা হচ্ছে */}
                  <OrderSummaryContent 
                      items={state.items}
                      totalPrice={totalPrice}
                      couponCode={couponCode}
                      setCouponCode={setCouponCode}
                      isApplyingCoupon={isApplyingCoupon}
                      handleApplyCoupon={handleApplyCoupon}
                      appliedCoupon={appliedCoupon}
                      handleRemoveCoupon={handleRemoveCoupon}
                      discountAmount={discountAmount}
                      finalTotal={finalTotal}
                  />
              </CardContent>
            )}
        </Card>
      </div>

       <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8 text-center">
        Enter Your Details
      </h1>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div className="lg:col-span-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormControl><FloatingLabelInput field={field} label="Full Name" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem><FormControl><FloatingLabelInput field={field} label="Delivery Address" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="altPhone" render={({ field }) => (
                  <FormItem><FormControl><FloatingLabelInput field={field} label="Phone Number" type="tel" /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="flex gap-4">
                  <Button type="button" onClick={() => setOrderType('delivery')} className={cn("flex-1 h-12 rounded-xl font-medium", orderType === 'delivery' ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80")}>Delivery</Button>
                  <Button type="button" onClick={() => setOrderType('pickup')} className={cn("flex-1 h-12 rounded-xl font-medium", orderType === 'pickup' ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80")}>Pickup</Button>
              </div>
              {orderType === 'delivery' && (
                <div className="space-y-6 p-4 border rounded-xl bg-muted/10 animate-in fade-in-50">
                    <FormField control={form.control} name="deliveryAddress" render={({ field }) => (
                        <FormItem><FormControl><FloatingLabelInput field={field} label="Delivery Address (If different)" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl><Checkbox checked={isSameAsAddress} onCheckedChange={() => setIsSameAsAddress(prev => !prev)} /></FormControl>
                        <div className="space-y-1 leading-none"><FormLabel className="font-normal">Same as primary address</FormLabel></div>
                    </FormItem>
                </div>
              )}
               {orderType === 'pickup' && (
                <div className="p-5 border rounded-xl bg-muted/50 animate-in fade-in-50 text-center space-y-2">
                    <p className="font-medium text-lg"><strong>Pickup Address:</strong> Janai, Garbagan, Hooghly</p>
                    <a href="https://maps.app.goo.gl/WV2JF8GJRJW9JwtW8" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 underline font-medium text-sm transition-colors">
                        <MapPin className="h-4 w-4" /> View on Google Maps
                    </a>
                    <p className="text-sm text-muted-foreground pt-2">Please collect your order from the counter.</p>
                </div>
              )}
              <h3 className="text-2xl font-bold font-headline text-center pt-4">Preferences</h3>
              <FormField control={form.control} name="preferredDate" render={({ field }) => (
                <FormItem><FormLabel className="text-muted-foreground text-xs ml-1">Delivery Date</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} min={new Date().toISOString().split("T")[0]} className="h-12 rounded-xl border-muted-foreground/30" /></FormControl><FormMessage /></FormItem>
              )} />
               <FormField control={form.control} name="mealTime" render={({ field }) => (
                <FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-12 rounded-xl border-muted-foreground/30"><SelectValue placeholder="Select Meal Time" /></SelectTrigger></FormControl><SelectContent><SelectItem value="lunch">Lunch</SelectItem><SelectItem value="dinner">Dinner</SelectItem></SelectContent></Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="instructions" render={({ field }) => (
                  <FormItem><FormControl><FloatingLabelTextarea field={field} label="Special Cooking Instructions (Optional)" /></FormControl><FormMessage /></FormItem>
              )} />
              {orderType === 'delivery' && (
                <FormField control={form.control} name="shareLocation" render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 bg-muted/10 p-3 rounded-lg border"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel className="font-normal cursor-pointer">Share my live location for better delivery</FormLabel></div></FormItem>
                )} />
              )}
              <FormField control={form.control} name="terms" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel className="font-normal">I agree to the <a href="/terms" target="_blank" className="underline text-primary font-medium">Terms and Conditions</a></FormLabel><FormMessage /></div></FormItem>
              )} />
              <Button type="submit" size="lg" className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                <Lock className="mr-2 h-5 w-5" /> Place Order
              </Button>
            </form>
          </Form>
        </div>
        <div className="lg:col-span-1 hidden lg:block">
          <Card className="sticky top-24 bg-card shadow-md border-0">
            <CardHeader className="border-b bg-muted/10">
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                {/* Props pass করা হচ্ছে */}
                <OrderSummaryContent 
                      items={state.items}
                      totalPrice={totalPrice}
                      couponCode={couponCode}
                      setCouponCode={setCouponCode}
                      isApplyingCoupon={isApplyingCoupon}
                      handleApplyCoupon={handleApplyCoupon}
                      appliedCoupon={appliedCoupon}
                      handleRemoveCoupon={handleRemoveCoupon}
                      discountAmount={discountAmount}
                      finalTotal={finalTotal}
                  />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}