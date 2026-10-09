'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_LINKS } from './admin-links';
import { cn } from '@/lib/utils';

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Admin"
      className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto border-b border-line px-4"
    >
      {ADMIN_LINKS.map((l) => {
        const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative inline-flex min-h-[48px] items-center whitespace-nowrap px-3 text-sm font-semibold',
              active
                ? 'text-ink after:absolute after:inset-x-2 after:bottom-0 after:h-[3px] after:rounded-full after:bg-navel'
                : 'text-muted hover:text-ink',
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
