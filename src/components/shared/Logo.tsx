import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ scrolled, variant = 'dark' }: { scrolled?: boolean, variant?: 'light' | 'dark' }) {
  
  if (variant === 'light') {
    return (
      <Link href="/" className="flex items-center gap-2">
        <span className="font-bold text-lg text-white">
          BUMBA'S KITCHEN
        </span>
      </Link>
    )
  }
  
  const textSize = scrolled ? 'text-lg' : 'text-xl';

  return (
    <Link href="/" className="flex items-center gap-2">
      <span className={cn(
        "font-bold leading-none transition-all duration-300 ease-in-out",
        scrolled ? "text-lg text-foreground" : "text-xl text-white"
      )}>
        BUMBA'S<br />KITCHEN
      </span>
    </Link>
  );
}
