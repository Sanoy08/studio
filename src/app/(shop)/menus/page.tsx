// src/app/(shop)/menus/page.tsx

import { MenusClient } from './MenusClient';
import { clientPromise } from '@/lib/mongodb';
import { Product } from '@/lib/types';

export const dynamic = 'force-dynamic'; // রিয়েল-টাইম আপডেটের জন্য

async function getMenuData() {
  try {
    const client = await clientPromise;
    const db = client.db('BumbasKitchenDB');
    
    const menuItems = await db.collection('menuItems').find({}).toArray();

    const products: Product[] = menuItems.map((doc) => ({
      id: doc._id.toString(),
      name: doc.Name || 'Unknown Dish',
      slug: (doc.Name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, ''),
      description: doc.Description || '',
      price: doc.Price || 0,
      category: { 
        id: (doc.Category || '').toLowerCase(), 
        name: doc.Category || 'Other' 
      },
      images: doc.ImageURLs?.map((url: string, index: number) => ({
        id: `img-${index}`,
        url: url,
        alt: doc.Name,
      })) || [],
      rating: 4.5,
      reviewCount: 0,
      stock: doc.InStock ? 100 : 0,
      featured: doc.Bestseller === true || doc.Bestseller === "true",
      isDailySpecial: doc.isDailySpecial === true, // ★ ম্যাপ করা হলো
      reviews: [],
      createdAt: doc.CreatedAt ? new Date(doc.CreatedAt).toISOString() : undefined
    }));

    return products;

  } catch (error) {
    console.error("Error fetching menu data:", error);
    return [];
  }
}

export default async function MenusPage() {
  const products = await getMenuData();

  return (
    <div>
      <div className="bg-primary/5 py-8 md:py-12 mb-6">
        <div className="container text-center">
            <h1 className="text-3xl md:text-5xl font-bold font-headline text-primary mb-3">Our Menu</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore our wide range of authentic delicacies.
            </p>
        </div>
      </div>
      
      <MenusClient initialProducts={products} />
    </div>
  );
}