'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ConsignmentStatusBadge } from './consignment-status';
import { ListingPhoto } from '@/components/listing/listing-photo';
import { QuoteLines } from '@/components/listing/quote-lines';
import { Timeline } from '@/components/orders/timeline';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { formatDate, formatMoney } from '@/lib/format';
import type { ConsignmentView } from '@/lib/types';

const PRICE_RE = /^\d+(\.\d{1,2})?$/;

/** One consigned item for its owner: status, timeline, payout and the actions the backend allows. */
export function ConsignmentCard({
  view,
  onSavePrice,
  onWithdraw,
  pending,
  error,
}: {
  view: ConsignmentView;
  onSavePrice: (cents: number) => void;
  onWithdraw: () => void;
  pending: boolean;
  error: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(
    view.item.askingPriceCents !== undefined ? String(view.item.askingPriceCents / 100) : '',
  );
  const bad = text !== '' && !PRICE_RE.test(text);
  const id = view.item.id;

  return (
    <article
      className="flex flex-col gap-4 rounded-card border border-line bg-surface p-4"
      aria-labelledby={`${id}-h`}
    >
      <div className="flex items-start gap-3">
        <ListingPhoto
          src={view.listing?.photos[0] ?? 'ph:Package:0'}
          alt=""
          className="h-16 w-16 shrink-0 rounded-input"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 id={`${id}-h`} className="font-sans text-lg font-bold">
            {view.item.label}
          </h3>
          <ConsignmentStatusBadge status={view.status} />
          <span className="tabular text-sm text-muted">
            Asking{' '}
            {view.item.askingPriceCents !== undefined ? formatMoney(view.item.askingPriceCents) : 'not set'}
            {view.status === 'listed' ||
            view.status === 'awaiting_listing' ||
            view.status === 'awaiting_checkin'
              ? ` · listed until ${formatDate(view.listUntil)}`
              : ''}
          </span>
        </div>
      </div>

      <Timeline steps={view.timeline} />

      {view.payout ? (
        <div className="flex flex-col gap-1">
          <QuoteLines quote={view.payout} totalLabel="Your payout" />
          {view.payoutSentAt ? (
            <p className="text-sm text-success">Sent {formatDate(view.payoutSentAt)}</p>
          ) : null}
        </div>
      ) : null}

      {editing ? (
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (text && !bad) onSavePrice(Math.round(Number(text) * 100));
          }}
        >
          <label htmlFor={`${id}-price`} className="text-sm font-semibold">
            New asking price ($)
          </label>
          <div className="flex gap-2">
            <Input
              id={`${id}-price`}
              inputMode="decimal"
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-invalid={bad}
              className="tabular max-w-[140px]"
            />
            <Button type="submit" disabled={pending || !text || bad}>
              {pending ? 'Saving…' : 'Save'}
            </Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
          {bad ? (
            <p role="alert" className="text-sm text-error">
              Enter an amount like 45 or 45.50.
            </p>
          ) : null}
        </form>
      ) : null}

      <FormError message={error} />

      <div className="flex flex-wrap gap-2">
        {view.listing ? (
          <Button asChild variant="secondary" size="sm">
            <Link href={`/listings/${view.listing.id}`}>View listing</Link>
          </Button>
        ) : null}
        {view.canEditPrice && !editing ? (
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
            Change price
          </Button>
        ) : null}
        {view.canWithdraw ? (
          <Button variant="destructive" size="sm" disabled={pending} onClick={onWithdraw}>
            Withdraw, return it to me
          </Button>
        ) : null}
      </div>
    </article>
  );
}
