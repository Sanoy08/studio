import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rating } from '@/components/shared/Rating';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden h-full transition-shadow hover:shadow-lg">
      <CardHeader className="p-0">
        <Link href={`/products/${product.slug}`} className="block aspect-square relative">
          <Image
            src={product.images[0].url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <p className="text-sm text-muted-foreground">{product.category.name}</p>
        <h3 className="font-semibold text-lg mt-1">{product.name}</h3>
        <div className="flex items-center gap-2 mt-2">
            <Rating rating={product.rating} />
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="font-bold text-xl">{formatPrice(product.price)}</p>
        <Button asChild size="sm">
          <Link href={`/products/${product.slug}`}>View <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
