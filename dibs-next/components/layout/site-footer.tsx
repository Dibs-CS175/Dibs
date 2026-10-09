import Link from 'next/link';
import { Logo } from '@/components/brand/logo';

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="container flex max-w-content flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <Logo size={20} />
          <p className="max-w-md text-sm text-muted">
            Dibs is an independent student marketplace. Not affiliated with or endorsed by any university.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-4 text-sm">
          <Link href="/browse" className="inline-flex min-h-[44px] items-center font-medium hover:text-rind">
            Browse
          </Link>
          <Link
            href="/summer-hold"
            className="inline-flex min-h-[44px] items-center font-medium hover:text-rind"
          >
            Summer Hold
          </Link>
          <Link href="/impact" className="inline-flex min-h-[44px] items-center font-medium hover:text-rind">
            Impact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
