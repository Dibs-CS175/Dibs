'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Archive } from 'lucide-react';
import { ConfirmSheet } from '@/components/confirm-sheet';
import { PageHeader } from '@/components/layout/page-header';
import { QuoteLines } from '@/components/listing/quote-lines';
import { EmptyState, ErrorState, PageSkeleton } from '@/components/states';
import { BookingChoices, BookingStatusBadge } from '@/components/summer-hold/booking-bits';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/field';
import { cancelBooking, payBalance } from '@/lib/actions/summerHold';
import { useTimeZone } from '@/lib/campus';
import { HOUSING_TYPES } from '@/lib/config/app';
import { errorMessage } from '@/lib/errorMessages';
import { formatMaybeDate, labelFor } from '@/lib/format';
import { useAction, useQuery } from '@/lib/hooks';
import { getSummerHoldOffers } from '@/lib/queries/pricing';
import { getMyBooking } from '@/lib/queries/summerHold';
import { ok } from '@/lib/result';
import type { SummerHoldOffers } from '@/lib/types';

export default function MyBookingPage() {
  const tz = useTimeZone();
  const { state, retry, setData } = useQuery(() => getMyBooking(), []);
  const campusId = state.status === 'data' && state.data ? state.data.booking.campusId : null;
  const offers = useQuery(
    () => (campusId ? getSummerHoldOffers(campusId) : Promise.resolve(ok<SummerHoldOffers | null>(null))),
    [campusId],
  );
  const [cancelOpen, setCancelOpen] = useState(false);
  const pay = useAction(payBalance);
  const cancel = useAction(cancelBooking);

  if (state.status === 'loading') return <PageSkeleton />;
  if (state.status === 'error') {
    return (
      <div className="container max-w-content py-16">
        <ErrorState message={errorMessage(state.error)} onRetry={retry} />
      </div>
    );
  }
  if (state.data === null) {
    return (
      <div className="container max-w-content py-16">
        <EmptyState
          icon={Archive}
          text="You don’t have a Summer Hold booking yet."
          actionLabel="Sign up"
          href="/summer-hold/book"
        />
      </div>
    );
  }

  const mb = state.data;
  const b = mb.booking;
  const addOnLabels =
    offers.state.status === 'data' && offers.state.data
      ? offers.state.data.addOns.filter((a) => b.addOnKeys.includes(a.key)).map((a) => a.label)
      : b.addOnKeys;

  return (
    <div className="container flex max-w-[760px] flex-col gap-8 py-8 md:py-12">
      <PageHeader title="My Summer Hold" subtitle={labelFor(HOUSING_TYPES, b.housingType)} />
      <div>
        <BookingStatusBadge status={b.status} />
      </div>

      <section aria-labelledby="choices-h" className="flex flex-col gap-3">
        <h2 id="choices-h" className="text-xl font-bold">
          Items and choices
        </h2>
        <div className="rounded-card border border-line bg-surface p-4">
          <BookingChoices booking={b} packingSlot={mb.packingSlot} addOnLabels={addOnLabels} />
        </div>
      </section>

      <section aria-labelledby="quote-h" className="flex flex-col gap-3">
        <h2 id="quote-h" className="text-xl font-bold">
          Your total
        </h2>
        <QuoteLines quote={b.quote} />
      </section>

      <section
        aria-labelledby="bal-h"
        className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4"
      >
        <h2 id="bal-h" className="text-xl font-bold">
          Balance
        </h2>
        <p>
          Balance due <strong>{formatMaybeDate(b.balanceDueAt, tz)}</strong>.
        </p>
        <FormError
          message={
            pay.error
              ? errorMessage(pay.error, {
                  DEADLINE_PASSED: 'The balance due date has passed. Contact Dibs to keep your booking.',
                })
              : null
          }
        />
        {mb.canPayBalance ? (
          <Button
            variant="dibs"
            className="w-fit"
            disabled={pay.pending}
            onClick={async () => {
              const r = await pay.run(b.id);
              if (r?.ok) {
                setData(r.data);
                toast.success('Balance paid');
              }
            }}
          >
            {pay.pending ? 'Paying…' : 'Pay balance'}
          </Button>
        ) : null}
      </section>

      <section aria-labelledby="cancel-h" className="flex flex-col gap-3">
        <h2 id="cancel-h" className="text-xl font-bold">
          Cancellation
        </h2>
        <p>
          Free cancellation until <strong>{formatMaybeDate(b.freeCancelUntil, tz)}</strong>. After that,
          registration is non-refundable.
        </p>
        {mb.canCancel ? (
          <Button variant="destructive" className="w-fit" onClick={() => setCancelOpen(true)}>
            Cancel booking
          </Button>
        ) : null}
      </section>

      <Button asChild variant="link" className="w-fit px-0">
        <Link href="/summer-hold">How Summer Hold works</Link>
      </Button>

      <ConfirmSheet
        open={cancelOpen}
        onOpenChange={(v) => {
          setCancelOpen(v);
          if (!v) cancel.clearError();
        }}
        title="Cancel Summer Hold?"
        body={`Free cancellation runs until ${formatMaybeDate(b.freeCancelUntil, tz)}. After that, registration is non-refundable.`}
        confirmLabel="Cancel booking"
        pendingLabel="Cancelling…"
        pending={cancel.pending}
        error={cancel.error ? errorMessage(cancel.error) : null}
        onConfirm={async () => {
          const r = await cancel.run(b.id);
          if (r?.ok) {
            setData(r.data);
            setCancelOpen(false);
            toast.success('Booking cancelled');
          }
        }}
      />
    </div>
  );
}
