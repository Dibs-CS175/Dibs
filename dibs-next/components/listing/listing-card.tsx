'use client';

import Link from 'next/link';
import { BadgeCheck, Heart } from 'lucide-react';
import { ListingPhoto } from './listing-photo';
import { ConditionBadge, HousingFitBadge, SourceBadge } from './badges';
import { formatMoney, shortName, timeAgo } from '@/lib/format';
import type { ListingCardView } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useTimeZone } from '@/lib/campus';

export function ListingCard({
  view,
  onToggleSave,
  savePending,
}: {
  view: ListingCardView;
  onToggleSave?: (listingId: string, next: boolean) => void;
  savePending?: boolean;
}) {
  const tz = useTimeZone();
  const { listing: l, seller, saved } = view;
  return (
    <article className="relative flex min-w-0 flex-col gap-2">
      <Link href={`/listings/${l.id}`} className="flex flex-col gap-2 rounded-card">
        <ListingPhoto
          src={l.photos[0] ?? 'ph:Package:0'}
          alt={l.title}
          className="aspect-[4/5] w-full rounded-card"
        />
        <div className="flex items-baseline justify-between gap-2 px-0.5">
          <span className="tabular font-display text-xl font-extrabold">
            {l.priceCents === 0 ? 'Free' : formatMoney(l.priceCents)}
          </span>
          <span className="whitespace-nowrap text-xs text-muted">{timeAgo(l.createdAt, tz)}</span>
        </div>
        <h3 className="line-clamp-2 px-0.5 font-sans text-sm font-semibold leading-snug">{l.title}</h3>
        <span className="flex min-w-0 items-center gap-1 px-0.5 text-xs text-muted">
          <span className="truncate">{shortName(seller)}</span>
          {seller.verified ? (
            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-success" aria-label="Verified student" />
          ) : null}
        </span>
      </Link>
      <div className="flex flex-wrap gap-1 px-0.5">
        <ConditionBadge condition={l.condition} />
        <HousingFitBadge fit={l.housingFit} />
        <SourceBadge source={l.source} />
      </div>
      {onToggleSave ? (
        <button
          type="button"
          disabled={savePending}
          onClick={() => onToggleSave(l.id, !saved)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${l.title} from saved` : `Save ${l.title}`}
          className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[#14201a] shadow-1 hover:bg-white disabled:opacity-60"
        >
          <Heart className={cn('h-5 w-5', saved && 'fill-[#e5484d] text-[#c6262e]')} aria-hidden />
        </button>
      ) : null}
    </article>
  );
}
