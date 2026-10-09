import { Timeline } from '@/components/orders/timeline';
import type { BookingStatus, TimelineStep } from '@/lib/types';

const ORDER: { status: BookingStatus; label: string }[] = [
  { status: 'deposit_paid', label: 'Deposit paid' },
  { status: 'paid', label: 'Balance paid' },
  { status: 'picked_up', label: 'Picked up' },
  { status: 'stored', label: 'In storage' },
  { status: 'returned', label: 'Returned' },
];

/** Maps the booking status onto a fixed list of stages for display. */
export function BookingTracker({ status }: { status: BookingStatus }) {
  if (status === 'cancelled') {
    return <p className="rounded-card bg-sunk p-4 font-semibold">This booking was cancelled.</p>;
  }
  const at = ORDER.findIndex((s) => s.status === status);
  const steps: TimelineStep[] = ORDER.map((s, i) => ({
    label: s.label,
    state: i <= at ? 'done' : i === at + 1 ? 'current' : 'upcoming',
  }));
  return <Timeline steps={steps} />;
}
