// src/app/api/menu/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Product, Image } from '@/lib/types';

// Database and Collection names from your input
const DB_NAME = 'BumbasKitchenDB';
const COLLECTION_NAME = 'menuItems';

// Helper function to map MongoDB document to Frontend Product type
const mapMongoProductToAppProduct = (doc: any, slug: string): Product => {
  // Map 'ImageURLs' (string[]) to 'images' (Image[])
  const images: Image[] = doc.ImageURLs?.map((url: string, index: number) => ({
    id: `img-${index}`,
    url: url,
    alt: doc.Name,
  })) || [];

  // Assuming 'Category' string should be mapped to the Category object structure
  const category: Image = {
    id: doc.Category.toLowerCase().replace(/\s+/g, '-'),
    name: doc.Category,
  } as unknown as Image; // Temporary casting until all category logic is updated

  // The MongoDB document structure is partially matched to the application's required structure
  return {
    id: doc._id.toString(), // Use MongoDB ObjectId as unique ID
    name: doc.Name || 'Unknown Dish',
    slug: slug, // Slug calculated at runtime or based on a new field if available
    description: doc.Description || 'No description provided.',
    price: doc.Price || 0,
    category: category as unknown as Product['category'],
    images: images,
    // Assuming 'Bestseller' can be mapped to 'featured'
    featured: doc.Bestseller === 'true' || doc.Bestseller === true,
    // Assuming 'InStock' can be used to set 'stock' quantity
    stock: doc.InStock === true ? 100 : 0, 
    rating: 4.5, // Default rating as there is no field in the Mongo document
    reviewCount: 0,
    reviews: [],
    createdAt: new Date().toISOString(), // Placeholder
  };
};

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise!; // Assert that clientPromise is not undefined
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Get all documents from the collection
    const menuItems = await collection.find({}).toArray();

    // Map the MongoDB documents to the expected Product structure
    const products: Product[] = menuItems.map((item) => {
      // Create a URL-friendly slug from the Name
      const slug = item.Name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');
      return mapMongoProductToAppProduct(item, slug);
    });

    return NextResponse.json(products, { status: 200 });

  } catch (error) {
    console.error('MongoDB GET Menu Error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch menu items', error: (error as Error).message },
      { status: 500 }
    );
  }
}