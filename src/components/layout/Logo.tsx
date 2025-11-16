import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ variant = 'dark' }: { variant?: 'light' | 'dark' }) {
  
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <span className={cn(
        "font-bold leading-tight text-lg transition-colors",
        variant === 'dark' ? "text-foreground group-hover:text-primary" : "text-primary-foreground group-hover:text-white/80"
      )}>
        BUMBA'S<br />KITCHEN
      </span>
    </Link>
  );
}
