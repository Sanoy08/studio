'use client';

import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CreditCard, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const checkoutSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(5, 'Valid ZIP code is required'),
  cardName: z.string().min(1, 'Name on card is required'),
  cardNumber: z.string().min(16, 'Valid card number is required').max(16),
  cardExpiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'MM/YY format required'),
  cardCvc: z.string().min(3, 'CVC is required').max(4),
});

export default function CheckoutPage() {
  const { state, totalPrice, itemCount, clearCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (itemCount === 0) {
      router.push('/menus');
    }
  }, [itemCount, router]);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      cardName: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvc: '',
    },
  });

  function onSubmit(values: z.infer<typeof checkoutSchema>) {
    console.log('Checkout submitted', values);
    // Here you would integrate with a payment processor
    alert('Order placed successfully! (This is a demo)');
    clearCart();
    router.push('/');
  }

  if (itemCount === 0) {
    return null; // or a loading spinner
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8 text-center">Checkout</h1>
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div className="lg:col-span-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                        <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid sm:grid-cols-3 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="state" render={({ field }) => (
                        <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="zip" render={({ field }) => (
                        <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="cardName" render={({ field }) => (
                        <FormItem><FormLabel>Name on Card</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="cardNumber" render={({ field }) => (
                        <FormItem><FormLabel>Card Number</FormLabel><FormControl><div className="relative"><CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-10" {...field} /></div></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="cardExpiry" render={({ field }) => (
                            <FormItem><FormLabel>MM/YY</FormLabel><FormControl><Input placeholder="MM/YY" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="cardCvc" render={({ field }) => (
                            <FormItem><FormLabel>CVC</FormLabel><FormControl><Input placeholder="CVC" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </CardContent>
              </Card>
              <Button type="submit" size="lg" className="w-full">
                <Lock className="mr-2 h-4 w-4" /> Place Order
              </Button>
            </form>
          </Form>
        </div>
        <div className="lg:col-span-1">
          <Card className="sticky top-24 bg-card">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                        <Image src={item.image.url} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p>{formatPrice(item.price * item.quantity)}</p>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
