// src/app/(auth)/verify-otp/page.tsx

'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const verifySchema = z.object({
  otp: z.string().min(6, "OTP must be at least 6 characters."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  phone: z.string().min(10, "Please enter a valid phone number."),
});

function VerifyOtpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  const email = searchParams.get('email') || '';
  const name = searchParams.get('name') || '';

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: { otp: "", password: "", phone: "" },
  });

  // শুধুমাত্র নম্বর টাইপ করার লজিক
  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, onChange: (...event: any[]) => void) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      onChange(value);
    }
  };

  async function onSubmit(values: z.infer<typeof verifySchema>) {
    if (!email) {
        toast.error("Email missing. Please register again.");
        router.push('/register');
        return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            name,
            otp: values.otp,
            password: values.password,
            phone: values.phone
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      login(data.user, data.token);

      toast.success("Account created successfully!");
      router.push('/account');

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Verify OTP</CardTitle>
          <CardDescription>
              An OTP has been sent to <strong>{email}</strong>.
              <br />Enter it below to complete registration.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
              
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTP Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter 6-digit OTP" 
                        {...field} 
                        // ★★★ FIX: নম্বর কিবোর্ড চালু করার জন্য inputMode="numeric" ★★★
                        inputMode="numeric" 
                        onChange={(e) => handleNumericInput(e, field.onChange)}
                        maxLength={6}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Set Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="******" 
                            {...field}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="9876543210" 
                        {...field} 
                        // ★★★ FIX: নম্বর কিবোর্ড চালু করার জন্য inputMode="numeric" ★★★
                        inputMode="numeric"
                        onChange={(e) => handleNumericInput(e, field.onChange)}
                        maxLength={10}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Create Account
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div className="flex justify-center pt-10"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <VerifyOtpForm />
        </Suspense>
    );
}