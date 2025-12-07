// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  
  // ১. Static Assets (/_next/static, favicon, etc.) সরাসরি পাস করে দাও (এগুলো রিরাইট হবে না)
  if (request.nextUrl.pathname.startsWith('/_next/static/') ||
      request.nextUrl.pathname.endsWith('.ico') ||
      request.nextUrl.pathname.endsWith('/sw.js')) {
    return NextResponse.next();
  }

  if (!hostname) {
      return NextResponse.next();
  }
  
  // ২. যদি এটি admin.bumbaskitchen.app হয়
  const isSubdomain = hostname.startsWith('admin.'); 

  if (isSubdomain) {
    const path = request.nextUrl.pathname;
    
    // ৩. যদি রুট অলরেডি /admin/ দিয়ে শুরু না হয়, তবে রিরাইট করো (যাতে /admin/login এ যায়)
    if (!path.startsWith('/admin')) {
      const newPath = `/admin${path}`;
      
      // এই রিরাইটটি Vercel কে বলে যে ইন্টারনালি এই রিকোয়েস্টটি /admin পাথের জন্য
      return NextResponse.rewrite(new URL(newPath, request.url));
    }
  }
  
  return NextResponse.next();
}

// কনফিগারেশন: Asset Path গুলো বাদ দেওয়া সহজ করার জন্য simplified matcher
export const config = {
  matcher: [
    '/',
    '/(api|admin|account|menus|checkout|notifications|register|login|forgot-password|reset-password)/:path*',
  ],
};