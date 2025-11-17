import { notFound } from 'next/navigation';
import { products } from '@/lib/data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { Plus, Minus, Star } from 'lucide-react';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/shop/ProductCard';
import { ProductDetailsClient } from './ProductDetailsClient';

function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }
  
  const relatedProducts = products.filter(p => p.category.id === product.category.id && p.id !== product.id).slice(0, 8);

  return <ProductDetailsClient product={product} relatedProducts={relatedProducts} />;
}
