import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ variant = 'dark', isScrolled = false }: { variant?: 'light' | 'dark', isScrolled?: boolean }) {
  
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <span className={cn(
        "font-bold leading-tight transition-all duration-300",
        variant === 'dark' ? "text-primary group-hover:text-primary/80" : "text-primary-foreground group-hover:text-white/80",
        isScrolled ? 'text-lg' : 'text-xl'
      )}>
        BUMBA'S<br />KITCHEN
      </span>
    </Link>
  );
}
