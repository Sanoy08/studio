// src/app/(auth)/reset-password/page.tsx

'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
    }
    if (newPassword.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
    }
    if (!token) {
        toast.error("Invalid or missing token");
        return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password reset successfully!");
        router.push('/login');
      } else {
        toast.error(data.error || "Failed to reset password");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
      return (
        <div className="text-center text-red-500 p-10">
            <h2 className="text-xl font-bold">Invalid Link</h2>
            <p>The password reset link is missing or invalid.</p>
        </div>
      )
  }

  return (
    <Card className="w-full max-w-md mx-auto my-20">
      <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>Create a new password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                          type={showPassword ? "text" : "password"} 
                          className="pl-10 pr-10"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                  </div>
              </div>
              
              <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                          type="password" 
                          className="pl-10"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                      />
                  </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Reset Password
              </Button>
          </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}