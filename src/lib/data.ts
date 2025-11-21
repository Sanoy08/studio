// sanoy08/studio/studio-aa52e24a282afd08f6d0f650cbc4061b0fabac53/src/lib/data.ts

import type { Product, Category, Review } from './types';

// Dummy data removed. These are placeholders now.
// Data will be fetched from MongoDB via API routes.
export const categories: Category[] = [
  { id: 'cat1', name: 'Veg' },
  { id: 'cat2', name: 'Chicken' },
  { id: 'cat3', name: 'Mutton' },
  { id: 'cat4', name: 'Egg' },
  { id: 'cat5', name: 'Fish' },
  { id: 'cat6', name: 'Breads' },
  { id: 'cat7', name: 'Desserts' },
  { id: 'cat8', name: 'Beverages' },
];

export const products: Product[] = []; // Will be an empty array until fetched

export const reviews: Review[] = []; // Will be an empty array until fetched