import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="font-bold text-lg leading-tight text-foreground">
        BUMBA'S<br />KITCHEN
      </span>
    </Link>
  );
}
