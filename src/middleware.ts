// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  const path = request.nextUrl.pathname;

  // ১. API CALLS এবং Static Assets কোনোভাবেই রিরাইট হবে না
  if (path.startsWith('/_next/') || path.startsWith('/api/') || path.endsWith('.ico') || path.startsWith('/static/')) {
      return NextResponse.next();
  }

  if (!hostname) {
      return NextResponse.next();
  }
  
  const isSubdomain = hostname.startsWith('admin.'); 

  if (isSubdomain) {
    
    // ২. যদি admin.bumbaskitchen.app হিট হয়, এবং এটি API বাদে অন্য কোনো পাথ হয়:
    // যেমন: admin.bumbaskitchen.app/dashboard -> bumbaskitchen.app/admin/dashboard
    if (!path.startsWith('/admin')) {
      const newPath = `/admin${path}`;
      
      // Rewrite করে /admin/ রুট এক্সেস করা হচ্ছে
      return NextResponse.rewrite(new URL(newPath, request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  // সকল রিকোয়েস্টের জন্য রান করবে
  matcher: [
    /*
     * সকল পাথ ম্যাচ করবে, কিন্তু Next.js এর ভেতরের ফাইলগুলো বাদ দেবে।
     */
    '/',
    '/(.*)',
  ],
};