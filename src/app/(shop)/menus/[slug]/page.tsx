// src/app/(shop)/menus/[slug]/page.tsx

import { ProductDetailsClient } from './ProductDetailsClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { clientPromise } from '@/lib/mongodb';
import { Product } from '@/lib/types';

// ডায়নামিক রেন্ডারিং (রিয়েল-টাইম ডেটার জন্য)
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
};

// ডাটাবেস থেকে প্রোডাক্ট খোঁজার ফাংশন
async function getProductData(slug: string) {
  try {
    const client = await clientPromise;
    const db = client.db('BumbasKitchenDB');
    
    // স্লাগ জেনারেট করার লজিক (ম্যাচ করার জন্য)
    // যেহেতু ডাটাবেসে স্লাগ ফিল্ড নেই, আমরা নাম দিয়ে খুঁজব না, বরং সব এনে ফিল্টার করব (ছোট ক্যাটালগ হলে ঠিক আছে)
    // অথবা পারফেক্ট হয় যদি আমরা _id দিয়ে খুঁজি, কিন্তু URL এ স্লাগ আছে।
    // বেস্ট প্র্যাকটিস: সব মেনু এনে ফিল্টার করা (যদি মেনু আইটেম <১০০০ হয়)
    
    const allItems = await db.collection('menuItems').find({}).toArray();
    
    const productDoc = allItems.find(item => {
        const itemSlug = (item.Name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');
        return itemSlug === slug;
    });

    if (!productDoc) return null;

    // মেইন প্রোডাক্ট ফরম্যাট করা
    const product: Product = {
      id: productDoc._id.toString(),
      name: productDoc.Name,
      slug: slug,
      description: productDoc.Description || '',
      price: productDoc.Price,
      category: { id: (productDoc.Category || '').toLowerCase(), name: productDoc.Category },
      images: productDoc.ImageURLs?.map((url: string, i: number) => ({ id: `img-${i}`, url, alt: productDoc.Name })) || [],
      rating: 4.5,
      reviewCount: 120, // ডামি ডেটা
      stock: productDoc.InStock ? 100 : 0,
      featured: productDoc.Bestseller === true,
      isDailySpecial: productDoc.isDailySpecial === true,
      reviews: [],
      createdAt: productDoc.CreatedAt ? new Date(productDoc.CreatedAt).toISOString() : undefined
    };

    // রিলেটেড প্রোডাক্ট (একই ক্যাটাগরির)
    const relatedProducts: Product[] = allItems
      .filter(item => item.Category === productDoc.Category && item._id.toString() !== productDoc._id.toString())
      .slice(0, 5)
      .map(doc => ({
        id: doc._id.toString(),
        name: doc.Name,
        slug: (doc.Name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, ''),
        description: doc.Description || '',
        price: doc.Price,
        category: { id: (doc.Category || '').toLowerCase(), name: doc.Category },
        images: doc.ImageURLs?.map((url: string, i: number) => ({ id: `img-${i}`, url, alt: doc.Name })) || [],
        rating: 4.2,
        reviewCount: 0,
        stock: doc.InStock ? 100 : 0,
        featured: doc.Bestseller === true,
        reviews: [],
      }));

    return { product, relatedProducts };

  } catch (error) {
    console.error("Error fetching product details:", error);
    return null;
  }
}

// মেটাডাটা (SEO)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductData(slug);
  if (!data) return { title: 'Dish Not Found' };
  
  return {
    title: `${data.product.name} - Order Online | Bumba's Kitchen`,
    description: data.product.description.slice(0, 160),
  };
}

// পেজ কম্পোনেন্ট
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const data = await getProductData(slug);

  if (!data) {
    notFound();
  }

  return (
    <ProductDetailsClient 
      product={data.product} 
      relatedProducts={data.relatedProducts} 
    />
  );
}