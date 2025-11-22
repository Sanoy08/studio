// src/app/(shop)/menus/[slug]/page.tsx

import { ProductDetailsClient } from './ProductDetailsClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// এই পেজটি সার্ভার কম্পোনেন্ট হিসেবে কাজ করবে
export const dynamic = 'force-dynamic';

async function getProduct(slug: string) {
  // অ্যাপের নিজস্ব API কল করা হচ্ছে
  // প্রোডাকশনে আপনার ডোমেইন ব্যবহার করতে হবে, লোকালহোস্টে এটি কাজ নাও করতে পারে যদি অ্যাবসলিউট URL না দেন
  // তাই আমরা সরাসরি ডাটাবেস লজিক এখানেও ব্যবহার করতে পারি, অথবা ক্লায়েন্ট সাইড ফেচিং করতে পারি।
  // সহজ করার জন্য আমরা এখানে ক্লায়েন্ট কম্পোনেন্টে ফেচিং এর দায়িত্ব দেব না, বরং সরাসরি সার্ভার সাইড ফেচ করব।
  
  try {
    // নোট: সার্ভার কম্পোনেন্টে নিজের API রুট কল করার চেয়ে সরাসরি লাইব্রেরি ফাংশন কল করা ভালো।
    // তবে আপনার সুবিধার জন্য আমরা এখানে `fetch` ব্যবহার করছি। ডেভেলপমেন্টে URL সমস্যা হতে পারে।
    // তাই আমরা এখানে `process.env.NEXT_PUBLIC_APP_URL` বা লোকালহোস্ট ব্যবহার করব।
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL; // আপনার পোর্ট নম্বর দিন
    const res = await fetch(`${baseUrl}/api/products/${slug}`, { cache: 'no-store' });
    
    if (!res.ok) return null;
    
    return res.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

// মেটাডাটা জেনারেট করা (SEO-র জন্য)
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getProduct(params.slug);
  if (!data || !data.product) {
    return { title: 'Product Not Found' };
  }
  return {
    title: `${data.product.name} | Bumba's Kitchen`,
    description: data.product.description,
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const data = await getProduct(params.slug);

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