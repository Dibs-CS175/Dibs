import { ConditionBadge, HousingFitBadge } from '@/components/listing/badges';
import { ListingPhoto } from '@/components/listing/listing-photo';
import { CATEGORIES } from '@/lib/config/app';
import { formatMoney, labelFor } from '@/lib/format';
import type { ListingDraftInput } from '@/lib/types';

/** Review step: shows the draft the way buyers will see it. */
export function ListingPreview({ draft }: { draft: ListingDraftInput }) {
  return (
    <div className="grid gap-4 rounded-card border border-line bg-surface p-4 md:grid-cols-[240px_1fr]">
      <ListingPhoto
        src={draft.photos[0] ?? 'ph:Package:0'}
        alt="Cover photo"
        className="aspect-[4/5] w-full rounded-card"
      />
      <div className="flex flex-col gap-2">
        <span className="tabular font-display text-3xl font-extrabold">
          {draft.priceCents === 0
            ? 'Free'
            : draft.priceCents !== null
              ? formatMoney(draft.priceCents)
              : 'No price'}
        </span>
        <h3 className="text-xl font-bold">{draft.title || 'Untitled'}</h3>
        <span className="text-sm text-muted">
          {draft.category ? labelFor(CATEGORIES, draft.category) : 'No category'}
        </span>
        <div className="flex flex-wrap gap-2">
          {draft.condition ? <ConditionBadge condition={draft.condition} /> : null}
          {draft.housingFit ? <HousingFitBadge fit={draft.housingFit} showExplain /> : null}
        </div>
        <p className="whitespace-pre-wrap text-sm">{draft.description}</p>
        <p className="text-sm text-muted">
          {draft.photos.length} photo{draft.photos.length === 1 ? '' : 's'}
        </p>
      </div>
    </div>
  );
}
