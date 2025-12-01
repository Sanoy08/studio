// src/lib/types.ts

export type Image = {
  id: string;
  url: string;
  alt: string;
};

export type Category = {
  id: string;
  name: string;
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: Category;
  images: Image[];
  rating: number;
  reviewCount: number;
  stock: number;
  reviews: Review[];
  featured: boolean;
  isDailySpecial?: boolean; // ★ নতুন ফিল্ড
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