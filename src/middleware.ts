// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  const path = request.nextUrl.pathname;

  // ★★★ FIX: Static Files (manifest, _next, favicon) সরাসরি পাস করে দেওয়া হচ্ছে ★★★
  if (path.startsWith('/_next/') || 
      path.endsWith('.ico') || 
      path.includes('manifest.json') || // manifest.json কে আলাদাভাবে বাদ দেওয়া হলো
      path.startsWith('/sw.js') ||
      path.startsWith('/api/') // API calls should also not be rewritten
      ) {
    return NextResponse.next();
  }

  if (!hostname) {
      return NextResponse.next();
  }
  
  const isSubdomain = hostname.startsWith('admin.'); 

  if (isSubdomain) {
    
    // ২. যদি admin.bumbaskitchen.app হিট হয় এবং এটি /admin দিয়ে শুরু না হয় (যেমন: admin.domain.app/)
    if (!path.startsWith('/admin')) {
      const newPath = `/admin${path}`;
      
      // Rewrite করে ইন্টারনাল /admin/ রুট এক্সেস করা হচ্ছে
      return NextResponse.rewrite(new URL(newPath, request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  // সকল নন-স্ট্যাটিক রিকোয়েস্ট ম্যাচ করবে
  matcher: [
    '/',
    '/((?!_next/static|favicon.ico|manifest.json|sw.js|.*\\..*).*)',
  ],
};