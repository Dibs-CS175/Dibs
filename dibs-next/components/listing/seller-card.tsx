'use client';

import { VerifiedBadge } from '@/components/listing/badges';
import { useTimeZone } from '@/lib/campus';
import { formatDate, shortName } from '@/lib/format';
import type { ListingSource, User } from '@/lib/types';

export function SellerCard({ seller, source }: { seller: User; source: ListingSource }) {
  const tz = useTimeZone();
  return (
    <section
      aria-label="Seller"
      className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sunk font-display text-lg font-bold"
        >
          {seller.firstName.slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 font-semibold">
            {shortName(seller)} <VerifiedBadge verified={seller.verified} />
          </p>
          <p className="text-sm text-muted">
            {source === 'goods'
              ? 'Checked and sold by Dibs'
              : `Member since ${formatDate(seller.memberSince, tz, { month: 'long', year: 'numeric' })}`}
          </p>
        </div>
      </div>
      <p className="tabular text-sm text-muted">{seller.tradesCount} trades completed</p>
    </section>
  );
}
