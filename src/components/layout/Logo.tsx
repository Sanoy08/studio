import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ isScrolled, isHomePage }: { isScrolled: boolean, isHomePage: boolean }) {
  
  const logoColorClass = (isHomePage && !isScrolled) ? 'text-white' : 'text-primary-foreground';

  return (
    <Link href="/" className="flex items-center gap-2 group">
      <span className={cn(
        "font-bold leading-tight transition-all duration-300",
        logoColorClass,
        isScrolled || !isHomePage ? 'text-lg' : 'text-xl'
      )}>
        BUMBA'S<br />KITCHEN
      </span>
    </Link>
  );
}
