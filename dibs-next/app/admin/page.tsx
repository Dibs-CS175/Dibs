import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ADMIN_LINKS } from '@/components/admin/admin-links';
import { PageHeader } from '@/components/layout/page-header';

const BLURBS: Record<string, string> = {
  '/admin/routes': 'Move-out pickups by day and building. Mark stops and check items in.',
  '/admin/returns': 'Fall return windows and the return route.',
  '/admin/bins': 'Capacity and contents for every bin in both units.',
  '/admin/consignment':
    'Sell items from Summer Hold: create listings, buyer pickup windows, damage and unsold items.',
  '/admin/payouts': 'Student payouts for sold consigned items. Mark each one sent.',
  '/admin/goods': 'Dibs Goods inventory: intake, hold, list, sell or dispose.',
  '/admin/reports': 'Open problem reports from orders and listings.',
};

export default function AdminHome() {
  return (
    <>
      <PageHeader title="Operations" subtitle="Summer Hold logistics, Goods inventory and reports." />
      <ul className="grid gap-3 md:grid-cols-2">
        {ADMIN_LINKS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex items-center gap-3 rounded-card border border-line bg-surface p-5 hover:bg-sunk"
            >
              <span className="flex flex-1 flex-col gap-1">
                <span className="font-display text-xl font-bold">{l.label}</span>
                <span className="text-sm text-muted">{BLURBS[l.href]}</span>
              </span>
              <ChevronRight className="h-5 w-5 text-muted" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
