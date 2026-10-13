'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, MessageCircle, Package, ShieldCheck, User } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { shortName } from '@/lib/format';
import type { User as UserT } from '@/lib/types';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/browse', label: 'Browse' },
  { href: '/sell', label: 'Sell' },
  { href: '/summer-hold', label: 'Summer Hold' },
];

/** Presentational header. The layout passes the session user (or null) in. */
export function SiteHeader({ user, campusName }: { user: UserT | null; campusName: string | null }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const link = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      aria-current={isActive(href) ? 'page' : undefined}
      className={cn(
        'inline-flex min-h-[44px] items-center rounded-input px-3 text-sm font-semibold',
        isActive(href) ? 'bg-white/15 text-white' : 'text-white/85 hover:bg-white/10 hover:text-white',
      )}
    >
      {label}
    </Link>
  );
  const iconLink = (href: string, label: string, Icon: typeof Package) => (
    <Link
      href={href}
      aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-full text-white hover:bg-white/10"
    >
      <Icon className="h-5 w-5" aria-hidden />
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 bg-grove text-white" style={{ height: 'var(--header-h)' }}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-input focus:bg-surface focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <div className="container flex h-full max-w-content items-center gap-2">
        <Link href="/" className="rounded-input" aria-label="Dibs home">
          <Logo onDark size={24} />
        </Link>
        {campusName ? (
          <span className="hidden rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/90 lg:inline">
            {campusName}
          </span>
        ) : null}
        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex">
          {LINKS.map((l) => link(l.href, l.label))}
          {user?.role === 'admin' ? link('/admin/goods', 'Admin') : null}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          {user ? (
            <>
              {iconLink('/messages', 'Messages', MessageCircle)}
              {iconLink('/orders', 'Orders', Package)}
              <Link
                href="/profile"
                className="ml-1 hidden min-h-[44px] items-center gap-2 rounded-full px-3 text-sm font-semibold hover:bg-white/10 md:inline-flex"
              >
                <User className="h-4 w-4" aria-hidden /> {shortName(user)}
              </Link>
            </>
          ) : (
            <Button asChild variant="secondary" size="sm" className="border-transparent">
              <Link href="/verify">
                <ShieldCheck className="h-4 w-4" aria-hidden /> Verify
              </Link>
            </Button>
          )}
          <Sheet>
            <SheetTrigger
              className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </SheetTrigger>
            <SheetContent title="Menu" side="right">
              <nav aria-label="Mobile" className="flex flex-col">
                {[
                  ...LINKS,
                  ...(user
                    ? [
                        { href: '/messages', label: 'Messages' },
                        { href: '/orders', label: 'Orders' },
                        { href: '/profile', label: 'Profile' },
                      ]
                    : []),
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="flex min-h-[48px] items-center rounded-input px-3 font-semibold hover:bg-sunk"
                  >
                    {l.label}
                  </Link>
                ))}
                {user?.role === 'admin' ? (
                  <Link
                    href="/admin"
                    className="flex min-h-[48px] items-center rounded-input px-3 font-semibold hover:bg-sunk"
                  >
                    Admin
                  </Link>
                ) : null}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
