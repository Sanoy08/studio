import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

type RatingProps = {
  rating: number;
  className?: string;
};

export function Rating({ rating, className }: RatingProps) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className={cn('flex items-center gap-0.5 text-amber-500', className)}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-4 w-4 fill-current" />
      ))}
      {halfStar && <StarHalf className="h-4 w-4 fill-current" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4" />
      ))}
    </div>
  );
}
