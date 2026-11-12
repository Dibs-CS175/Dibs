'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { ListingPhoto } from './listing-photo';
import { ConditionBadge, HousingFitBadge, SourceBadge, VerifiedBadge } from './badges';
import { formatMoney, shortName, timeAgo } from '@/lib/format';
import type { ListingCardView } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useTimeZone } from '@/lib/campus';
import { usePrefersReducedMotion } from '@/lib/hooks';

/** How long a just-published listing stays highlighted. */
const NEW_FOR_MS = 30_000;

/** True while the listing is under about 30 seconds old, then turns itself off. */
function useJustListed(createdAt: string, enabled: boolean): boolean {
  const [fresh, setFresh] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const age = Date.now() - new Date(createdAt).getTime();
    // A clock that runs behind the server makes the age negative; never highlight longer than the window.
    const left = Math.min(NEW_FOR_MS, NEW_FOR_MS - age);
    if (!(left > 0)) {
      setFresh(false);
      return;
    }
    setFresh(true);
    const id = window.setTimeout(() => setFresh(false), left);
    return () => window.clearTimeout(id);
  }, [createdAt, enabled]);
  return fresh;
}

export function ListingCard({
  view,
  onToggleSave,
  savePending,
  highlightNew = false,
}: {
  view: ListingCardView;
  onToggleSave?: (listingId: string, next: boolean) => void;
  savePending?: boolean;
  /** Outline the card while it is under about 30 seconds old (used on Browse). */
  highlightNew?: boolean;
}) {
  const tz = useTimeZone();
  const { listing: l, seller, saved } = view;
  const reducedMotion = usePrefersReducedMotion();
  const isNew = useJustListed(l.createdAt, highlightNew);
  return (
    <article
      className={cn(
        'relative flex min-w-0 flex-col gap-2 rounded-card',
        !reducedMotion && 'transition-shadow duration-320 ease-dibs',
        isNew && 'ring-2 ring-navel ring-offset-4 ring-offset-background',
        isNew && !reducedMotion && 'animate-in fade-in slide-in-from-top-2 duration-320',
      )}
    >
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
          <VerifiedBadge verified={seller.verified} size="sm" />
        </span>
      </Link>
      <div className="flex flex-wrap gap-1 px-0.5">
        <ConditionBadge condition={l.condition} />
        <HousingFitBadge fit={l.housingFit} />
        <SourceBadge source={l.source} />
      </div>
      {isNew ? (
        <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-navel px-2 py-0.5 text-xs font-bold text-on-accent shadow-1">
          New
        </span>
      ) : null}
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
