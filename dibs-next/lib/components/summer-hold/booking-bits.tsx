'use client';

import { Badge } from '@/components/ui/badge';
import { useTimeZone } from '@/lib/campus';
import { formatWindow } from '@/lib/format';
import type { BookingStatus, SlotView, SummerHoldBooking } from '@/lib/types';

const STATUS: Record<BookingStatus, { label: string; variant: 'outline' | 'warning' | 'success' | 'error' }> =
  {
    draft: { label: 'Not registered yet', variant: 'outline' },
    registered: { label: 'Registered', variant: 'warning' },
    balance_paid: { label: 'Paid in full', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'error' },
  };

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const s = STATUS[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

/** Items and choices on a booking. Add-on labels come from getSummerHoldOffers. */
export function BookingChoices({
  booking,
  packingSlot,
  addOnLabels,
}: {
  booking: SummerHoldBooking;
  packingSlot: SlotView | null;
  addOnLabels: string[];
}) {
  const tz = useTimeZone();
  return (
    <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
      <dt className="font-semibold">Pickup address</dt>
      <dd>{booking.address}</dd>
      <dt className="font-semibold">Items</dt>
      <dd className="tabular">
        {booking.standardCount} standard, {booking.largeCount} large
      </dd>
      <dt className="font-semibold">Full Service</dt>
      <dd>
        {booking.fullService
          ? packingSlot
            ? `Yes, packing ${formatWindow(packingSlot.startsAt, packingSlot.endsAt, tz)}`
            : 'Yes'
          : 'No, I’ll pack myself'}
      </dd>
      <dt className="font-semibold">Add-ons</dt>
      <dd>{addOnLabels.length ? addOnLabels.join(', ') : 'None'}</dd>
      {booking.referralCode ? (
        <>
          <dt className="font-semibold">Referral code</dt>
          <dd className="font-mono">{booking.referralCode}</dd>
        </>
      ) : null}
    </dl>
  );
}
