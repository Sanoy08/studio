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
import { Loader2, Cake, Heart, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { NotificationPermission } from '@/components/shared/NotificationPermission';

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
  const { user, login } = useAuth(); // login ফাংশন ব্যবহার করব আপডেট করার জন্য

  // পাসওয়ার্ড ভিজিবিলিটি স্টেট
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

  // ★★★ ১. নতুন ফিচার: পেজ লোড হলেই সার্ভার থেকে লেটেস্ট ডেটা আনবে ★★★
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
                    // login ফাংশন কল করে আমরা পুরো অ্যাপের স্টেট এবং লোকাল স্টোরেজ আপডেট করে দিচ্ছি
                    // এতে অন্য ডিভাইসের পরিবর্তন এখানেও চলে আসবে
                    login(data.user, token);
                    console.log("Profile synced with server");
                }
            }
        } catch (error) {
            console.error("Failed to sync profile", error);
        }
    };

    fetchLatestData();
  }, []); // এটি শুধুমাত্র একবার রান হবে

  // ২. ইউজার ডেটা অনুযায়ী ফর্ম ফিল করা
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

      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to update profile');
      }
      
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

        if (!res.ok) {
            throw new Error(responseData.error || 'Failed to change password');
        }

        toast.success(responseData.message);
        passwordForm.reset();
    } catch (error: any) {
        toast.error(error.message || 'Failed to change password.');
    }
  }

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  }
  
  const { isSubmitting: isProfileSubmitting } = profileForm.formState;
  const { isSubmitting: isPasswordSubmitting } = passwordForm.formState;

  // @ts-ignore
  const hasDob = !!user?.dob && user.dob !== "";
  // @ts-ignore
  const hasAnniversary = !!user?.anniversary && user.anniversary !== "";

  return (
    <div className="space-y-8">
      <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>This is how others will see you on the site.</CardDescription>
                </div>
                <NotificationPermission />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-8">
                <Avatar className="h-20 w-20 border-2 border-muted">
                    <AvatarImage src={user?.picture || ''} alt={user?.name || ''} />
                    <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                        {user?.name ? getInitials(user.name) : ''}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="text-xl font-bold">{user?.name}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
            </div>

            <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                            <Input placeholder="Your First Name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                            <Input placeholder="Your Last Name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Email" type="email" {...field} disabled className="bg-muted/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                      <FormField
                        control={profileForm.control}
                        name="dob"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                                <Cake className="h-4 w-4 text-pink-500" /> Birthday
                                {hasDob && <Lock className="h-3 w-3 text-muted-foreground ml-auto" />}
                            </FormLabel>
                            <FormControl>
                              <Input type="date" {...field} disabled={hasDob} className={hasDob ? "bg-muted/50 cursor-not-allowed" : ""} />
                            </FormControl>
                            {!hasDob && (
                                <FormDescription className="text-xs">
                                    Get special offers! (Cannot be changed later)
                                </FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="anniversary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                                <Heart className="h-4 w-4 text-red-500" /> Anniversary
                                {hasAnniversary && <Lock className="h-3 w-3 text-muted-foreground ml-auto" />}
                            </FormLabel>
                            <FormControl>
                              <Input type="date" {...field} disabled={hasAnniversary} className={hasAnniversary ? "bg-muted/50 cursor-not-allowed" : ""} />
                            </FormControl>
                            {!hasAnniversary && (
                                <FormDescription className="text-xs">
                                    Celebrate with us! (Cannot be changed later)
                                </FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isProfileSubmitting} className="w-full sm:w-auto">
                        {isProfileSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                  </div>
                </form>
            </Form>
          </CardContent>
      </Card>
      
      <Card>
           <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                    For your security, please choose a strong password.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type={showCurrentPass ? "text" : "password"} {...field} className="pr-10" />
                                            <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                                {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type={showNewPass ? "text" : "password"} {...field} className="pr-10" />
                                            <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                                {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type={showConfirmPass ? "text" : "password"} {...field} className="pr-10" />
                                            <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                                {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end">
                            <Button type="submit" variant="outline" disabled={isPasswordSubmitting} className="w-full sm:w-auto">
                            {isPasswordSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Change Password
                            </Button>
                        </div>
                    </form>
                 </Form>
            </CardContent>
      </Card>
    </div>
  );
}