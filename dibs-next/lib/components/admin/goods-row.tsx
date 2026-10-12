'use client';

import { ListingPhoto } from '@/components/listing/listing-photo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/config/app';
import { formatDate, formatMoney, labelFor } from '@/lib/format';
import type { GoodsItem, GoodsStatus } from '@/lib/types';
import { useTimeZone } from '@/lib/campus';

export const GOODS_STATUSES: { id: GoodsStatus; label: string }[] = [
  { id: 'intake', label: 'Intake' },
  { id: 'holding', label: 'Holding' },
  { id: 'listed', label: 'Listed' },
  { id: 'sold', label: 'Sold' },
  { id: 'disposed', label: 'Disposed' },
];

type GoodsAction = 'list' | 'sold' | 'dispose';

/** Shows the actions that make sense for the item's current status. The backend still decides. */
export function GoodsRow({
  item,
  onAction,
  pending,
}: {
  item: GoodsItem;
  onAction: (a: GoodsAction) => void;
  pending: boolean;
}) {
  const tz = useTimeZone();
  const open = item.status !== 'sold' && item.status !== 'disposed';
  return (
    <li className="flex flex-col gap-3 rounded-card border border-line bg-surface p-3 md:flex-row md:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <ListingPhoto
          src={item.photos[0] ?? 'ph:Package:0'}
          alt=""
          className="h-14 w-14 shrink-0 rounded-input"
        />
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-semibold">{item.title}</span>
          <span className="truncate text-sm text-muted">
            {labelFor(CATEGORIES, item.category)} · in {formatDate(item.intakeDate, tz)}
            {item.serialNumber ? ` · SN ${item.serialNumber}` : ''}
          </span>
          {item.holdUntil && item.status === 'holding' ? (
            <span className="text-sm text-rind">
              On hold, unlisted until {formatDate(item.holdUntil, tz)}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="tabular flex flex-col text-right text-sm">
          <span className="font-semibold">{formatMoney(item.priceCents)}</span>
          {item.costCents !== undefined ? (
            <span className="text-muted">cost {formatMoney(item.costCents)}</span>
          ) : null}
        </span>
        <Badge
          variant={item.status === 'listed' ? 'success' : item.status === 'holding' ? 'warning' : 'outline'}
        >
          {labelFor(GOODS_STATUSES, item.status)}
        </Badge>
      </div>
      {open ? (
        <div className="flex flex-wrap gap-2">
          {item.status === 'intake' ? (
            <Button size="sm" disabled={pending} onClick={() => onAction('list')}>
              List
            </Button>
          ) : null}
          {item.status === 'listed' ? (
            <Button size="sm" disabled={pending} onClick={() => onAction('sold')}>
              Mark sold
            </Button>
          ) : null}
          <Button size="sm" variant="destructive" disabled={pending} onClick={() => onAction('dispose')}>
            Dispose
          </Button>
        </div>
      ) : null}
    </li>
  );
}
