// next.config.ts

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // ★★★ এই লাইনটি যোগ করুন ★★★
    // এটি Vercel-কে ইমেজ প্রসেস করতে বাধা দেবে, ফলে লিমিট শেষ হবে না।
    // ছবি সরাসরি Cloudinary থেকে লোড হবে (ব্যান্ডউইথ Cloudinary-র খরচ হবে)।
    unoptimized: true, 
    
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;