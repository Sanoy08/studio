// src/app/(shop)/menus/[slug]/page.tsx

import { ProductDetailsClient } from './ProductDetailsClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// এই পেজটি সার্ভার কম্পোনেন্ট হিসেবে কাজ করবে
export const dynamic = 'force-dynamic';

// টাইপ ডেফিনিশন আপডেট করা হয়েছে (params এখন Promise)
type Props = {
  params: Promise<{ slug: string }>;
};

async function getProduct(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const res = await fetch(`${baseUrl}/api/products/${slug}`, { cache: 'no-store' });
    
    if (!res.ok) return null;
    
    return res.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

// মেটাডাটা জেনারেট করার ফাংশন আপডেট
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // ★★★ এখানে params কে await করা হচ্ছে ★★★
  const { slug } = await params;
  
  const data = await getProduct(slug);
  if (!data || !data.product) {
    return { title: 'Product Not Found' };
  }
  return {
    title: `${data.product.name} | Bumba's Kitchen`,
    description: data.product.description,
  };
}

// পেজ কম্পোনেন্ট আপডেট
export default async function ProductPage({ params }: Props) {
  // ★★★ এখানেও params কে await করা হচ্ছে ★★★
  const { slug } = await params;
  
  const data = await getProduct(slug);

  if (!data || !data.product) {
    notFound();
  }

  return (
    <ProductDetailsClient 
      product={data.product} 
      relatedProducts={data.relatedProducts} 
    />
  );
}