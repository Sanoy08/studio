'use client';

import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CreditCard, Lock, ChevronDown, ChevronUp } from 'lucide-react';
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
import { useUser } from '@/firebase';


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

export default function CheckoutPage() {
  const { state, totalPrice, itemCount, clearCart } = useCart();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    if (itemCount === 0) {
      router.push('/menus');
    }
  }, [itemCount, user, isUserLoading, router]);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      address: '',
      altPhone: '',
      deliveryAddress: '',
      mealTime: 'lunch',
      instructions: '',
      terms: false,
      shareLocation: false,
    },
  });
  
  const { watch, setValue, reset } = form;
  const primaryAddress = watch('address');
  
  // Use a state for the checkbox to avoid re-renders on address change
  const [isSameAsAddress, setIsSameAsAddress] = useState(false);

  useEffect(() => {
    if(user) {
        reset({
            name: user.displayName || '',
            altPhone: user.phoneNumber || '',
        })
    }
  }, [user, reset])


  useEffect(() => {
    if (isSameAsAddress) {
        setValue('deliveryAddress', primaryAddress);
    } else {
        setValue('deliveryAddress', '');
    }
  }, [isSameAsAddress, primaryAddress, setValue]);


  function onSubmit(values: z.infer<typeof checkoutSchema>) {
    console.log('Checkout submitted', values);
    // Here you would integrate with a payment processor
    alert('Order placed successfully! (This is a demo)');
    clearCart();
    router.push('/');
  }

  if (itemCount === 0 || isUserLoading || !user) {
    return null; // or a loading spinner
  }

  const FloatingLabelInput = ({ field, label, type = 'text' }: any) => (
    <div className="relative">
      <Input type={type} placeholder=" " {...field} className="pt-6 peer" />
      <FormLabel className="absolute text-sm text-muted-foreground duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] start-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
        {label}
      </FormLabel>
    </div>
  );

  const FloatingLabelTextarea = ({ field, label }: any) => (
    <div className="relative">
      <Textarea placeholder=" " {...field} className="pt-6 peer min-h-[100px]" />
      <FormLabel className="absolute text-sm text-muted-foreground duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] start-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
        {label}
      </FormLabel>
    </div>
  );
  
  const OrderSummaryContent = () => (
    <>
      <h3 className="font-bold text-lg mb-4">Your Order</h3>
       <div className="space-y-4">
        {state.items.map(item => (
          <div key={item.id} className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-md overflow-hidden border">
              <Image src={item.image.url} alt={item.name} fill className="object-cover" />
               <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {item.quantity}
                </div>
            </div>
            <div className="flex-grow">
              <p className="font-medium text-sm">{item.name}</p>
            </div>
            <p className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>
      <Separator className="my-4" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <p className="text-muted-foreground">Subtotal</p>
          <p>{formatPrice(totalPrice)}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-muted-foreground">Shipping</p>
          <p>Free</p>
        </div>
        <div className="flex justify-between">
          <p className="text-muted-foreground">Taxes</p>
          <p>Calculated at next step</p>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="flex justify-between font-bold text-lg">
        <p>Total</p>
        <p>{formatPrice(totalPrice)}</p>
      </div>
    </>
  );

  return (
    <div className="container py-8 md:py-12">
      <div className="lg:hidden mb-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4 cursor-pointer" onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Order Summary</h2>
                {isSummaryExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
              <p className="font-bold text-lg">{formatPrice(totalPrice)}</p>
            </CardHeader>
            {isSummaryExpanded && (
              <CardContent className="p-4 border-t">
                  <OrderSummaryContent />
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
                  <FormItem><FormControl><FloatingLabelInput field={field} label="Name" /></FormControl><FormMessage /></FormItem>
              )} />
              
              <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem><FormControl><FloatingLabelInput field={field} label="Address" /></FormControl><FormMessage /></FormItem>
              )} />
              
              <FormField control={form.control} name="altPhone" render={({ field }) => (
                  <FormItem><FormControl><FloatingLabelInput field={field} label="Alternate Phone Number" type="tel" /></FormControl><FormMessage /></FormItem>
              )} />

              <div className="flex gap-4">
                  <Button type="button" onClick={() => setOrderType('delivery')} className={cn("flex-1", orderType !== 'delivery' && 'bg-muted text-muted-foreground hover:bg-muted/80')}>Delivery</Button>
                  <Button type="button" onClick={() => setOrderType('pickup')} className={cn("flex-1", orderType !== 'pickup' && 'bg-muted text-muted-foreground hover:bg-muted/80')}>Pickup</Button>
              </div>

              {orderType === 'delivery' && (
                <div className="space-y-6 p-4 border rounded-lg animate-in fade-in-50">
                    <FormField control={form.control} name="deliveryAddress" render={({ field }) => (
                        <FormItem><FormControl><FloatingLabelInput field={field} label="Delivery Address" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                            <Checkbox
                            checked={isSameAsAddress}
                            onCheckedChange={() => setIsSameAsAddress(prev => !prev)}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>
                            Same as your address
                            </FormLabel>
                        </div>
                    </FormItem>
                </div>
              )}
              
               {orderType === 'pickup' && (
                <div className="p-4 border rounded-lg bg-muted/50 animate-in fade-in-50">
                    <p><strong>Pickup Address:</strong> Janai, Garbagan, Hooghly</p>
                    <p><strong>Google Maps:</strong> <a href="https://maps.app.goo.gl/WV2JF8GJRJW9JwtW8" target="_blank" rel="noopener noreferrer" className="text-primary underline">View on Google Maps</a></p>
                </div>
              )}

              <h3 className="text-2xl font-bold font-headline text-center pt-4">Delivery Details</h3>

              <FormField control={form.control} name="preferredDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Date</FormLabel>
                  <FormControl><Input type="date" {...field} min={new Date().toISOString().split("T")[0]} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
               <FormField control={form.control} name="mealTime" render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Time</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a meal time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="instructions" render={({ field }) => (
                  <FormItem><FormControl><FloatingLabelTextarea field={field} label="Special Instructions" /></FormControl><FormMessage /></FormItem>
              )} />
              
              {orderType === 'delivery' && (
                <FormField control={form.control} name="shareLocation" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <div className="space-y-1 leading-none"><FormLabel>Share my live location</FormLabel></div>
                  </FormItem>
                )} />
              )}
              
              <FormField control={form.control} name="terms" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>I agree to the <a href="/terms" target="_blank" className="underline text-primary">Terms and Conditions</a></FormLabel>
                        <FormMessage />
                    </div>
                  </FormItem>
              )} />

              <Button type="submit" size="lg" className="w-full">
                <Lock className="mr-2 h-4 w-4" /> Place Order
              </Button>
            </form>
          </Form>
        </div>
        <div className="lg:col-span-1 hidden lg:block">
          <Card className="sticky top-24 bg-card">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <OrderSummaryContent />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
