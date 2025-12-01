// src/app/(shop)/page.tsx

import { HomeClient } from '@/components/shop/HomeClient';
import { clientPromise } from '@/lib/mongodb';
import { Product } from '@/lib/types';

// রিয়েল-টাইম আপডেটের জন্য ক্যাশিং বন্ধ
export const dynamic = 'force-dynamic';

async function getHomePageData() {
  try {
    const client = await clientPromise;
    const db = client.db('BumbasKitchenDB');

    // সব ডেটা একসাথে আনা হচ্ছে (Parallel Fetching)
    const [slidesData, offersData, productsData] = await Promise.all([
      db.collection('heroSlides').find({}).sort({ order: 1 }).toArray(),
      db.collection('offers').find({ active: true }).toArray(),
      db.collection('menuItems').find({}).toArray()
    ]);

    // স্লাইডার ম্যাপ
    const heroSlides = slidesData.map(slide => ({
      id: slide._id.toString(),
      imageUrl: slide.imageUrl,
      clickUrl: slide.clickUrl,
    }));

    // অফার ম্যাপ
    const offers = offersData.map(offer => ({
      id: offer._id.toString(),
      title: offer.title,
      description: offer.description,
      price: offer.price,
      imageUrl: offer.imageUrl,
    }));

    // সব প্রোডাক্ট ম্যাপ
    const allProducts = productsData.map(item => ({
      id: item._id.toString(),
      name: item.Name,
      slug: item.Name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, ''),
      description: item.Description || '',
      price: item.Price,
      category: { id: item.Category?.toLowerCase(), name: item.Category },
      images: item.ImageURLs?.map((url: string, i: number) => ({ id: `img-${i}`, url, alt: item.Name })) || [],
      rating: 4.5,
      reviewCount: 0,
      stock: item.InStock ? 100 : 0,
      featured: item.Bestseller === true || item.Bestseller === "true",
      // ★★★ এই ফ্ল্যাগটি অ্যাডমিন থেকে সেট করা হয় ★★★
      isDailySpecial: item.isDailySpecial === true, 
      createdAt: item.CreatedAt ? new Date(item.CreatedAt).toISOString() : undefined
    }));

    // ফিল্টারিং
    const bestsellers = allProducts.filter((p: any) => p.featured).slice(0, 8);

    return { heroSlides, offers, bestsellers, allProducts };

  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return { heroSlides: [], offers: [], bestsellers: [], allProducts: [] };
  }
}

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <HomeClient 
      heroSlides={data.heroSlides} 
      offers={data.offers} 
      bestsellers={data.bestsellers as Product[]} 
      allProducts={data.allProducts as Product[]} 
    />
  );
}