'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

function GoogleCallbackProcessor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        // আমাদের কাস্টম হুক দিয়ে লগইন করা হচ্ছে
        login(userData, token);
        // সফল হলে অ্যাকাউন্টে রিডাইরেক্ট
        router.push('/account');
      } catch (error) {
        console.error("Failed to parse user data:", error);
        router.push('/login?error=AuthDataInvalid');
      }
    } else {
      router.push('/login?error=AuthFailed');
    }
  }, [searchParams, login, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Logging in with Google...</p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>}>
      <GoogleCallbackProcessor />
    </Suspense>
  );
}