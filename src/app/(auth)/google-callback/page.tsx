// src/app/(auth)/google-callback/page.tsx

'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function GoogleCallbackProcessor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState('Processing...');
  const [error, setError] = useState<string | null>(null);
  
  // ★★★ FIX: লুপ আটকানোর জন্য রিফ ব্যবহার ★★★
  const processedRef = useRef(false);

  useEffect(() => {
    // যদি ইতিমধ্যে প্রসেস হয়ে থাকে, তবে থামুন
    if (processedRef.current) return;

    const processLogin = async () => {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');
        const errorParam = searchParams.get('error');

        if (errorParam) {
            processedRef.current = true;
            setStatus('Login Failed');
            setError(`Google reported an error: ${errorParam}`);
            return;
        }

        if (!token || !userStr) {
            // প্যারামিটার না পেলে অপেক্ষা করুন (Next.js মাঝে মাঝে হাইড্রেশনের সময় নাল দেয়)
            return; 
        }

        // একবার ডেটা পেলে ফ্ল্যাগ সেট করুন
        processedRef.current = true;

        try {
            const userData = JSON.parse(userStr);
            console.log("Parsed User Data:", userData);

            // লগইন কল
            login(userData, token);
            setStatus('Success! Redirecting...');

            // রিডাইরেক্ট
            setTimeout(() => {
                router.push('/account');
                router.refresh();
            }, 1000);

        } catch (err: any) {
            console.error("Callback Error:", err);
            setStatus('Error');
            setError(err.message || "Failed to process login data.");
        }
    };

    processLogin();
  }, [searchParams, login, router]);

  if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 text-center">
            <div className="h-16 w-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-red-600">Login Failed</h2>
            <p className="text-muted-foreground max-w-md bg-muted p-3 rounded text-sm font-mono text-left">
                {error}
            </p>
            <Button asChild variant="outline">
                <Link href="/login">Back to Login</Link>
            </Button>
        </div>
      );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      {status === 'Success! Redirecting...' ? (
          <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-in zoom-in">
              <CheckCircle2 className="h-8 w-8" />
          </div>
      ) : (
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
      )}
      
      <h2 className="text-lg font-semibold">{status}</h2>
      <p className="text-muted-foreground text-sm">Please wait while we verify your account...</p>
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