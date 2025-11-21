// sanoy08/studio/studio-aa52e24a282afd08f6d0f650cbc4061b0fabac53/src/lib/types.ts

export type Image = {
  id: string;
  url: string;
  alt: string;
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
};

export type Category = {
  id: string;
  name: string;
};

// UPDATED: Reflects MongoDB structure (camelCase conversion for JS/TS naming convention)
export type Product = {
  id: string; // Will use MongoDB's _id as string
  name: string; // Maps to 'Name'
  slug: string;
  description: string;
  price: number; // Maps to 'Price'
  category: Category; // Mapped from 'Category' string for uniformity
  images: Image[]; // Mapped from 'ImageURLs' array of strings
  rating: number;
  reviewCount: number;
  stock: number; // Mapped from 'InStock' (needs conversion logic)
  reviews: Review[];
  featured: boolean; // Mapped from 'Bestseller'
  createdAt?: string;
};

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: Image;
  quantity: number;
};