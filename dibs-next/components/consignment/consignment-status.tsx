import { Badge } from '@/components/ui/badge';
import type { ConsignmentStatus } from '@/lib/types';

const MAP: Record<
  ConsignmentStatus,
  { label: string; variant: 'warning' | 'success' | 'error' | 'default' | 'outline' | 'zest' }
> = {
  awaiting_checkin: { label: 'Waiting for check-in', variant: 'outline' },
  awaiting_listing: { label: 'Being listed', variant: 'default' },
  listed: { label: 'Listed', variant: 'zest' },
  sold: { label: 'Sold, awaiting pickup', variant: 'warning' },
  payout_pending: { label: 'Payout processing', variant: 'warning' },
  paid_out: { label: 'Paid out', variant: 'success' },
  unsold_to_goods: { label: 'Unsold, moved to Goods', variant: 'outline' },
  withdrawn: { label: 'Withdrawn', variant: 'outline' },
  damaged: { label: 'Damaged', variant: 'error' },
};

export const CONSIGNMENT_STATUSES = (Object.keys(MAP) as ConsignmentStatus[]).map((id) => ({
  id,
  label: MAP[id].label,
}));

/** Statuses where the item is still on its way to a payout. Used only to group the list. */
export const ACTIVE_CONSIGNMENT: ConsignmentStatus[] = [
  'awaiting_checkin',
  'awaiting_listing',
  'listed',
  'sold',
  'payout_pending',
];

export function ConsignmentStatusBadge({ status }: { status: ConsignmentStatus }) {
  const s = MAP[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
