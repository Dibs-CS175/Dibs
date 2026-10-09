import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ListingPhoto } from '@/components/listing/listing-photo';
import { OrderStatusBadge } from './order-status';
import { formatDate, formatMoney, shortName } from '@/lib/format';
import type { OrderSummary } from '@/lib/types';

export function OrderRow({ summary }: { summary: OrderSummary }) {
  const { order: o, listing, viewerRole, counterpart } = summary;
  return (
    <Link
      href={`/orders/${o.id}`}
      className="flex items-center gap-3 rounded-card border border-line bg-surface p-3 hover:bg-sunk"
    >
      <ListingPhoto
        src={listing.photos[0] ?? 'ph:Package:0'}
        alt=""
        className="h-16 w-16 shrink-0 rounded-input"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate font-semibold">{listing.title}</span>
        <span className="truncate text-sm text-muted">
          {viewerRole === 'buyer' ? 'From' : 'To'} {shortName(counterpart)} · {formatDate(o.createdAt)}
        </span>
        <OrderStatusBadge status={o.status} />
      </div>
      <span className="tabular shrink-0 font-semibold">{formatMoney(o.quote.totalCents)}</span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
    </Link>
  );
}
