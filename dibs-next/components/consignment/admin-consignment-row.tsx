'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ConsignListingForm } from './consign-listing-form';
import { ConsignmentStatusBadge } from './consignment-status';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/field';
import { formatDate, formatMoney, shortName } from '@/lib/format';
import type { ConsignedListingInput, ConsignmentAdminView } from '@/lib/types';

/** One consigned item for staff. Buttons follow the item's status; the backend still decides. */
export function AdminConsignmentRow({
  view,
  pending,
  error,
  onPublish,
  onMoveToGoods,
  onDamage,
}: {
  view: ConsignmentAdminView;
  pending: boolean;
  error: string | null;
  onPublish: (input: ConsignedListingInput) => void;
  onMoveToGoods: () => void;
  onDamage: () => void;
}) {
  const [listing, setListing] = useState(false);
  const s = view.status;
  const open = s === 'awaiting_listing' || s === 'listed' || s === 'sold' || s === 'awaiting_checkin';
  return (
    <li className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-semibold">{view.item.label}</span>
          <span className="text-sm text-muted">
            Owner {shortName(view.owner)} · asking{' '}
            {view.item.askingPriceCents !== undefined ? formatMoney(view.item.askingPriceCents) : 'not set'} ·
            listed until {formatDate(view.listUntil)}
          </span>
          {view.item.binId ? (
            <span className="text-sm text-muted">Bin {view.item.binId.toUpperCase()}</span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ConsignmentStatusBadge status={s} />
          {view.payoutMethod.status === 'not_set' ? <Badge variant="error">No payout method</Badge> : null}
        </div>
      </div>
      {listing && s === 'awaiting_listing' ? (
        <ConsignListingForm item={view.item} pending={pending} error={error} onSubmit={onPublish} />
      ) : (
        <FormError message={error} />
      )}
      {open ? (
        <div className="flex flex-wrap gap-2">
          {s === 'awaiting_listing' && !listing ? (
            <Button size="sm" onClick={() => setListing(true)}>
              Create listing
            </Button>
          ) : null}
          {view.listing ? (
            <Button asChild size="sm" variant="secondary">
              <Link href={`/listings/${view.listing.id}`}>View listing</Link>
            </Button>
          ) : null}
          {s === 'listed' ? (
            <Button size="sm" variant="secondary" disabled={pending} onClick={onMoveToGoods}>
              Unsold: move to Goods
            </Button>
          ) : null}
          {s !== 'awaiting_checkin' ? (
            <Button size="sm" variant="destructive" disabled={pending} onClick={onDamage}>
              Record damage
            </Button>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
