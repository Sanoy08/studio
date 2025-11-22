// src/app/(shop)/page.tsx

import { HomeClient } from '@/components/shop/HomeClient';
import { clientPromise } from '@/lib/mongodb';
import { Product } from '@/lib/types';

// এই পেজটি প্রতি ৬০ সেকেন্ড পর পর সার্ভারে নতুন করে ক্যাশ হবে (ISR)
export const revalidate = 60; 

async function getHomePageData() {
  try {
    const client = await clientPromise;
    const db = client.db('BumbasKitchenDB');

    // Parallel fetching for max speed
    const [slidesData, offersData, productsData] = await Promise.all([
      db.collection('heroSlides').find({}).sort({ order: 1 }).toArray(),
      db.collection('offers').find({ active: true }).toArray(),
      db.collection('menuItems').find({}).toArray()
    ]);

    // Data serialization (MongoDB Object ID to String)
    const heroSlides = slidesData.map(slide => ({
      id: slide._id.toString(),
      imageUrl: slide.imageUrl,
      clickUrl: slide.clickUrl,
    }));

    const offers = offersData.map(offer => ({
      id: offer._id.toString(),
      title: offer.title,
      description: offer.description,
      price: offer.price,
      imageUrl: offer.imageUrl,
    }));

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
      featured: item.Bestseller === true,
      reviews: [],
      createdAt: item.CreatedAt ? new Date(item.CreatedAt).toISOString() : undefined
    }));

    // Filter bestsellers
    const featured = allProducts.filter((p: any) => p.featured);
    const bestsellers = featured.length > 0 ? featured : allProducts.slice(0, 8);

    return { heroSlides, offers, bestsellers };

  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return { heroSlides: [], offers: [], bestsellers: [] };
  }
}

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <HomeClient 
      heroSlides={data.heroSlides} 
      offers={data.offers} 
      bestsellers={data.bestsellers} // টাইপ ঠিক করার জন্য 'as Product[]' লাগতে পারে যদি টাইপ মিসম্যাচ হয়
    />
  );
}