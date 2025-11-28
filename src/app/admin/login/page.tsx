// src/app/admin/login/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react'; // Eye আইকন ইমপোর্ট
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // স্টেট যোগ করা হয়েছে
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.user.role !== 'admin') {
          toast.error("Access Denied: You are not an administrator.");
          setIsLoading(false);
          return;
      }

      login(data.user, data.token);
      toast.success("Welcome back, Admin!");
      window.location.href = '/admin'; 

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] dark:bg-[#121212] p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
            <CardHeader className="text-center space-y-2 pb-2">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#2c3e50]">Admin Portal</CardTitle>
                <CardDescription>Secure access for Bumba's Kitchen staff only.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="admin@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-12"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input 
                                id="password" 
                                type={showPassword ? "text" : "password"} // টগল লজিক
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-12 pr-10"
                            />
                            {/* আই বাটন */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <Button type="submit" className="w-full h-12 text-lg font-medium mt-4" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        Access Dashboard
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center pb-6">
                <p className="text-xs text-muted-foreground">Unauthorized access is prohibited.</p>
            </CardFooter>
        </Card>
    </div>
  );
}