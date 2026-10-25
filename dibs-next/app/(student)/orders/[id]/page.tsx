'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ChevronLeft, CreditCard, MapPin, PackageX } from 'lucide-react';
import { ConfirmSheet } from '@/components/confirm-sheet';
import { ListingPhoto } from '@/components/listing/listing-photo';
import { QuoteLines } from '@/components/listing/quote-lines';
import { HandoffCodeDisplay, HandoffCodeEntry } from '@/components/orders/handoff';
import { OrderStatusBadge } from '@/components/orders/order-status';
import { Timeline } from '@/components/orders/timeline';
import { EmptyState, ErrorState, PageSkeleton } from '@/components/states';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/field';
import { cancelOrder, enterHandoffCode, payOrder } from '@/lib/actions/orders';
import { useTimeZone } from '@/lib/campus';
import { errorMessage } from '@/lib/errorMessages';
import { formatDateTime, shortName } from '@/lib/format';
import { useAction, useQuery } from '@/lib/hooks';
import { getOrder } from '@/lib/queries/orders';

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const tz = useTimeZone();
  const { state, retry, setData } = useQuery(() => getOrder(id), [id]);
  const handoff = useAction(enterHandoffCode);
  const cancel = useAction(cancelOrder);
  const pay = useAction(payOrder);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [locked, setLocked] = useState(false);

  if (state.status === 'loading') return <PageSkeleton />;
  if (state.status === 'error') {
    return (
      <div className="container max-w-content py-16">
        {state.error.code === 'NOT_FOUND' ? (
          <EmptyState
            icon={PackageX}
            text="We couldn’t find that order."
            actionLabel="See all orders"
            href="/orders"
          />
        ) : (
          <ErrorState message={errorMessage(state.error)} onRetry={retry} />
        )}
      </div>
    );
  }

  const d = state.data;
  const o = d.order;
  const name = shortName(d.counterpart);
  const isBuyer = d.viewerRole === 'buyer';

  return (
    <div className="container flex max-w-[760px] flex-col gap-6 py-6 md:py-10">
      <Button asChild variant="link" className="w-fit px-0">
        <Link href="/orders">
          <ChevronLeft className="h-4 w-4" aria-hidden /> All orders
        </Link>
      </Button>

      <div className="flex items-center gap-4">
        <ListingPhoto
          src={d.listing.photos[0] ?? 'ph:Package:0'}
          alt=""
          className="h-20 w-20 shrink-0 rounded-card"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-2xl font-extrabold md:text-3xl">{d.listing.title}</h1>
          <p className="text-sm text-muted">
            {isBuyer ? 'Seller' : 'Buyer'}: {name}
          </p>
          <OrderStatusBadge status={o.status} />
        </div>
      </div>

      {o.status === 'pending_payment' && isBuyer ? (
        <div className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4">
          <p className="font-semibold">Finish paying to hold this item.</p>
          <FormError
            message={pay.error ? errorMessage(pay.error, { CONFLICT: 'Someone called dibs first.' }) : null}
          />
          <Button
            variant="dibs"
            className="w-fit"
            disabled={pay.pending}
            onClick={async () => {
              const r = await pay.run(o.id);
              if (r?.ok) {
                toast.success('Paid. Dibs Protect is holding your payment.');
                retry();
              }
            }}
          >
            <CreditCard className="h-4 w-4" aria-hidden /> {pay.pending ? 'Paying…' : 'Pay with Dibs Protect'}
          </Button>
        </div>
      ) : null}

      {o.status === 'held' && isBuyer && o.handoffCodeVisibleToBuyer ? (
        <HandoffCodeDisplay code={o.handoffCodeVisibleToBuyer} />
      ) : null}
      {o.status === 'held' && !isBuyer ? (
        <HandoffCodeEntry
          pending={handoff.pending}
          locked={locked}
          attemptsRemaining={o.attemptsRemaining}
          error={
            handoff.error
              ? errorMessage(handoff.error, {
                  ATTEMPTS_EXCEEDED:
                    'Too many wrong codes. The handoff is locked; Dibs will contact you both.',
                  CONFLICT: 'This order changed. Refresh to see the latest.',
                })
              : null
          }
          onSubmit={async (code) => {
            const r = await handoff.run(o.id, code);
            if (!r) return;
            if (r.ok) {
              toast.success('Handoff confirmed. Payment released.');
              retry();
            } else if (r.error.code === 'ATTEMPTS_EXCEEDED') {
              setLocked(true);
            } else if (r.error.code === 'CODE_INVALID') {
              // The backend lowers attemptsRemaining; reload the order to show the new count.
              retry();
            }
          }}
        />
      ) : null}

      {d.meetupSpot ? (
        <p className="flex items-start gap-2 rounded-card bg-sunk p-4">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            <strong>{d.meetupSpot.name}</strong>
            {o.meetupTime ? ` · ${formatDateTime(o.meetupTime, tz)}` : null}
            <span className="block text-sm text-muted">{d.meetupSpot.description}</span>
          </span>
        </p>
      ) : null}

      <section aria-labelledby="tl-h" className="flex flex-col gap-3">
        <h2 id="tl-h" className="text-xl font-bold">
          Status
        </h2>
        <Timeline steps={d.timeline} />
      </section>

      <section aria-labelledby="pay-h" className="flex flex-col gap-3">
        <h2 id="pay-h" className="text-xl font-bold">
          {isBuyer ? 'What you pay' : 'What you receive'}
        </h2>
        {isBuyer ? (
          <QuoteLines quote={o.quote} />
        ) : (
          <QuoteLines quote={o.payoutQuote} totalLabel="You receive" />
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="secondary">
          <Link href={`/listings/${d.listing.id}`}>View listing</Link>
        </Button>
        {d.canCancel ? (
          <Button variant="destructive" onClick={() => setCancelOpen(true)}>
            Cancel order
          </Button>
        ) : null}
      </div>

      <ConfirmSheet
        open={cancelOpen}
        onOpenChange={(v) => {
          setCancelOpen(v);
          if (!v) cancel.clearError();
        }}
        title="Cancel this order?"
        body="Dibs Protect returns any held payment to the buyer and the listing goes back on Browse."
        confirmLabel="Cancel order"
        pendingLabel="Cancelling…"
        pending={cancel.pending}
        error={
          cancel.error
            ? errorMessage(cancel.error, {
                CONFLICT: 'This order already moved forward and can no longer be cancelled.',
              })
            : null
        }
        onConfirm={async () => {
          const r = await cancel.run(o.id);
          if (r?.ok) {
            setCancelOpen(false);
            toast.success('Order cancelled');
            setData({ ...d, order: r.data, canCancel: false });
          }
        }}
      />
    </div>
  );
}
