import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ scrolled }: { scrolled?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className={cn(
        "font-bold leading-none text-white transition-all duration-300 ease-in-out",
        scrolled ? "text-base text-foreground" : "text-lg"
      )}>
        BUMBA'S<br />KITCHEN
      </span>
    </Link>
  );
}
