// src/app/(auth)/register/page.tsx

'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react'; // আইকন ইমপোর্ট
import { useAuth } from '@/hooks/use-auth';

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  // আপাতত শুধু OTP পাঠানোর জন্য পাসওয়ার্ড ফিল্ড এখানে লাগছে না, তবে যদি ফ্লো পরিবর্তন হয় তবে রাখা যেতে পারে।
  // আপনার বর্তমান ফ্লো অনুযায়ী প্রথমে শুধু নাম আর ইমেইল দিয়ে OTP পাঠানো হয়।
});

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { firstName: "", lastName: "", email: "" },
  });

  if (!isAuthLoading && user) {
      router.push('/account');
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
        const res = await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: values.email,
                name: `${values.firstName} ${values.lastName}`
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Failed to send OTP');
        }
      
      toast.success("OTP sent to your email!");
      router.push(`/verify-otp?email=${encodeURIComponent(values.email)}&name=${encodeURIComponent(values.firstName + ' ' + values.lastName)}`);

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
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Create an account to start shopping.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send OTP
              </Button>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline hover:text-primary transition-colors">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}