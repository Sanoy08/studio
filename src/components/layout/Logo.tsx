import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo() {
  
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <span className={cn(
        "font-bold text-lg leading-tight text-foreground transition-all duration-300",
      )}>
        BUMBA'S<br />KITCHEN
      </span>
    </Link>
  );
}
