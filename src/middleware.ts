// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// এই ফাংশনটি ইউজার কোন ডোমেইনে আছে তা চেক করবে
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  
  // ★★★ FIX: hostname null কি না চেক করা হচ্ছে ★★★
  if (!hostname) {
      return NextResponse.next();
  }
  
  // চেক করা হচ্ছে: এটি কি 'admin.' সাবডোমেইন, নাকি localhost:9002 (ডেভেলপমেন্ট চেক)
  // Vercel এ deploy হলে hostname এ সবসময় admin.bumbaskitchen.app থাকবে
  const isSubdomain = hostname.startsWith('admin.'); 

  if (isSubdomain) {
    const path = request.nextUrl.pathname;
    
    // যদি রুট আগেই '/admin' দিয়ে শুরু হয় (যেমন: admin.domain.app/admin/orders), তবে কিছু করার দরকার নেই
    if (path.startsWith('/admin')) {
      return NextResponse.next();
    }
    
    // API Route-গুলোও যেন সঠিক URL পায়, তাই /api বাদে সব রিকোয়েস্টকে /admin/ এর সাথে রিরাইট করা হচ্ছে
    // উদাহরণ: admin.bumbaskitchen.app/orders -> bumbaskitchen.app/admin/orders
    const newPath = `/admin${path}`;
    
    // ★ Rewrite করে দিচ্ছি (URL বারে দেখাবে না, কিন্তু অ্যাপ /admin/ রুট এক্সেস করবে)
    return NextResponse.rewrite(new URL(newPath, request.url));
  }
  
  // মেইন ডোমেইন বা অন্য রুটের জন্য (যেমন: bumbaskitchen.app/menu)
  return NextResponse.next();
}

// কোন রুটগুলোতে middleware রান করবে, তার কনফিগারেশন
export const config = {
  // সকল রিকোয়েস্টের জন্য রান করবে, কিন্তু .static/.public এবং Next.js এর ভেতরের ফাইলগুলো বাদ দেবে
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/ (API routes) -> Handled internally by rewrite logic
     * - _next/static (static files)
     * - favicon.ico
     */
    '/',
    '/(.*)',
    '/((?!_next/static|favicon.ico|manifest.json|api/|.*\\..*).*)',
  ],
};