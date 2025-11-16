import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="text-lg font-bold leading-none text-white">
        BUMBA'S<br />KITCHEN
      </span>
    </Link>
  );
}
