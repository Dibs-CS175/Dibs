import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/lib/types';

const MAP: Record<
  OrderStatus,
  { label: string; variant: 'warning' | 'success' | 'error' | 'default' | 'outline' }
> = {
  pending_payment: { label: 'Waiting for payment', variant: 'outline' },
  held: { label: 'Held by Dibs Protect', variant: 'warning' },
  released: { label: 'Complete', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'outline' },
  refunded: { label: 'Refunded', variant: 'default' },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const s = MAP[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
