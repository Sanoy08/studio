// src/app/(shop)/account/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, Cake, Heart, Lock, Eye, EyeOff, User, Mail, ShieldCheck, Save, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { NotificationPermission } from '@/components/shared/NotificationPermission';
import { Separator } from '@/components/ui/separator';

const profileFormSchema = z.object({
  firstName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  lastName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email(),
  dob: z.string().optional(),
  anniversary: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const passwordFormSchema = z.object({
    currentPassword: z.string().min(1, { message: "Current password is required." }),
    newPassword: z.string().min(8, { message: "New password must be at least 8 characters." }),
    confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match.",
    path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function AccountProfilePage() {
  const { user, login, logout } = useAuth();
  
  // Password Visibility States
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { firstName: '', lastName: '', email: '', dob: '', anniversary: '' },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" }
  });

  // পেজ লোড হলে ফ্রেশ ডেটা আনা
  useEffect(() => {
    const fetchLatestData = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.user) {
                    login(data.user, token);
                }
            }
        } catch (error) {
            console.error("Failed to sync profile", error);
        }
    };
    fetchLatestData();
  }, []);

  useEffect(() => {
    if (user) {
      const nameParts = user.name?.split(' ') || ['', ''];
      // @ts-ignore
      const userDob = user.dob || '';
      // @ts-ignore
      const userAnniversary = user.anniversary || '';

      profileForm.reset({
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' '),
        email: user.email || '',
        dob: userDob,
        anniversary: userAnniversary,
      })
    }
  }, [user, profileForm]);

  async function onProfileSubmit(data: ProfileFormValues) {
    if (!user) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            dob: data.dob,
            anniversary: data.anniversary
        }),
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || 'Failed to update profile');
      
      login(responseData.user, token || '');
      toast.success(responseData.message);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile.');
    }
  }

  async function onPasswordSubmit(data: PasswordFormValues) {
    if (!user) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            }),
        });
        const responseData = await res.json();
        if (!res.ok) throw new Error(responseData.error || 'Failed to change password');
        toast.success(responseData.message);
        passwordForm.reset();
    } catch (error: any) {
        toast.error(error.message || 'Failed to change password.');
    }
  }

  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
  
  const { isSubmitting: isProfileSubmitting } = profileForm.formState;
  const { isSubmitting: isPasswordSubmitting } = passwordForm.formState;

  // @ts-ignore
  const hasDob = !!user?.dob && user.dob !== "";
  // @ts-ignore
  const hasAnniversary = !!user?.anniversary && user.anniversary !== "";

  if (!user) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="bg-gray-50/50 min-h-screen pb-20">
      
      {/* --- 1. HEADER SECTION --- */}
      <div className="bg-white border-b pt-10 pb-16 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
         <div className="container relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                <Avatar className="h-28 w-28 border-4 border-white shadow-xl">
                    <AvatarImage src={user?.picture || ''} alt={user?.name || ''} />
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-orange-600 text-white">
                        {getInitials(user.name)}
                    </AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left mb-2 flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">Hello, {user.name.split(' ')[0]}! 👋</h1>
                    <p className="text-muted-foreground mt-1">Manage your personal info, security, and preferences.</p>
                </div>
                <div className="flex gap-3">
                    <NotificationPermission />
                    <Button variant="outline" onClick={logout} className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                    </Button>
                </div>
            </div>
         </div>
      </div>

      {/* --- 2. MAIN CONTENT GRID --- */}
      <div className="container -mt-8 relative z-20">
        <div className="grid lg:grid-cols-3 gap-8">
            
            {/* --- LEFT: PROFILE FORM --- */}
            <Card className="lg:col-span-2 shadow-lg border-0 overflow-hidden">
                <CardHeader className="bg-white border-b pb-6">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User className="h-5 w-5" /></div>
                        Personal Information
                    </CardTitle>
                    <CardDescription>Update your personal details here.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-6">
                    <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={profileForm.control} name="firstName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl><Input placeholder="John" {...field} className="h-12 bg-gray-50/50" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={profileForm.control} name="lastName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl><Input placeholder="Doe" {...field} className="h-12 bg-gray-50/50" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <FormField control={profileForm.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <FormControl>
                                            <Input placeholder="email@example.com" {...field} disabled className="pl-10 h-12 bg-gray-100 text-muted-foreground cursor-not-allowed border-transparent" />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <div className="p-5 bg-amber-50/50 rounded-xl border border-amber-100 space-y-5">
                                <div className="flex items-center gap-2 text-amber-800 font-medium pb-2 border-b border-amber-100">
                                    <Sparkles className="h-4 w-4" /> Special Dates <span className="text-xs font-normal text-amber-600 ml-auto">*Get exclusive offers</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField control={profileForm.control} name="dob" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground font-bold">
                                                <Cake className="h-3 w-3" /> Birthday {hasDob && <Lock className="h-3 w-3 ml-auto" />}
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} disabled={hasDob} className={`h-11 ${hasDob ? "bg-white/50" : "bg-white border-amber-200"}`} />
                                            </FormControl>
                                        </FormItem>
                                    )} />
                                    <FormField control={profileForm.control} name="anniversary" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground font-bold">
                                                <Heart className="h-3 w-3" /> Anniversary {hasAnniversary && <Lock className="h-3 w-3 ml-auto" />}
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} disabled={hasAnniversary} className={`h-11 ${hasAnniversary ? "bg-white/50" : "bg-white border-amber-200"}`} />
                                            </FormControl>
                                        </FormItem>
                                    )} />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button type="submit" disabled={isProfileSubmitting} className="min-w-[140px] h-12 text-base shadow-lg shadow-primary/20">
                                    {isProfileSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* --- RIGHT: SECURITY FORM --- */}
            <Card className="shadow-lg border-0 h-fit sticky top-24">
                <CardHeader className="bg-white border-b pb-6">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><ShieldCheck className="h-5 w-5" /></div>
                        Security
                    </CardTitle>
                    <CardDescription>Update your password.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                            <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type={showCurrentPass ? "text" : "password"} {...field} className="pr-10 h-11" />
                                            <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                                {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            
                            <Separator />

                            <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type={showNewPass ? "text" : "password"} {...field} className="pr-10 h-11" />
                                            <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                                {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type={showConfirmPass ? "text" : "password"} {...field} className="pr-10 h-11" />
                                            <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                                {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <Button type="submit" variant="outline" disabled={isPasswordSubmitting} className="w-full h-11 mt-2">
                                {isPasswordSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update Password"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

        </div>
      </div>
    </div>
  );
}