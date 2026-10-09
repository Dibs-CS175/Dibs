'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ChevronLeft, Flag, MapPin, PackageX, Star } from 'lucide-react';
import { ConfirmSheet } from '@/components/confirm-sheet';
import { ListingPhoto } from '@/components/listing/listing-photo';
import { QuoteLines } from '@/components/listing/quote-lines';
import { ReportSheet } from '@/components/listing/sheets';
import { HandoffCodeDisplay, HandoffCodeEntry } from '@/components/orders/handoff';
import { OrderStatusBadge } from '@/components/orders/order-status';
import { RatingSheet } from '@/components/orders/rating-sheet';
import { Timeline } from '@/components/orders/timeline';
import { EmptyState, ErrorState, PageSkeleton } from '@/components/states';
import { Button } from '@/components/ui/button';
import { cancelOrder, enterHandoffCode } from '@/lib/actions/orders';
import { submitRating } from '@/lib/actions/ratings';
import { reportProblem } from '@/lib/actions/reports';
import { formatDateTime, shortName } from '@/lib/format';
import { useAction, useQuery } from '@/lib/hooks';
import { getOrder } from '@/lib/queries/orders';
import { messageFor } from '@/lib/result';

export default function OrderPage({ params }: { params: { id: string } }) {
  const { state, retry, setData } = useQuery(() => getOrder(params.id), [params.id]);
  const handoff = useAction(enterHandoffCode);
  const cancel = useAction(cancelOrder);
  const report = useAction(reportProblem);
  const rate = useAction(submitRating);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);

  if (state.status === 'loading') return <PageSkeleton />;
  if (state.status === 'error') {
    return (
      <div className="container max-w-content py-16">
        {state.error.code === 'NOT_FOUND' ? (
          <EmptyState
            icon={PackageX}
            text="We couldn't find that order."
            actionLabel="See all orders"
            href="/orders"
          />
        ) : (
          <ErrorState message={state.error.message} onRetry={retry} />
        )}
      </div>
    );
  }

  const d = state.data;
  const o = d.order;
  const name = shortName(d.counterpart);

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
            {d.viewerRole === 'buyer' ? 'Seller' : 'Buyer'}: {name}
          </p>
          <OrderStatusBadge status={o.status} />
        </div>
      </div>

      {o.status === 'held' && d.viewerRole === 'buyer' && o.handoffCodeVisibleToBuyer ? (
        <HandoffCodeDisplay code={o.handoffCodeVisibleToBuyer} />
      ) : null}
      {o.status === 'held' && d.viewerRole === 'seller' ? (
        <HandoffCodeEntry
          pending={handoff.pending}
          error={
            handoff.error
              ? messageFor(handoff.error, { CONFLICT: 'This order changed. Refresh to see the latest.' })
              : null
          }
          onSubmit={async (code) => {
            const r = await handoff.run(o.id, code);
            if (r?.ok) {
              toast.success('Handoff confirmed. Payment released.');
              retry();
            }
          }}
        />
      ) : null}

      {o.meetupSpot ? (
        <p className="flex items-start gap-2 rounded-card bg-sunk p-4">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            <strong>{o.meetupSpot}</strong>
            {o.meetupTime ? ` · ${formatDateTime(o.meetupTime)}` : null}
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
          Payment
        </h2>
        <QuoteLines quote={o.quote} />
      </section>

      <div className="flex flex-wrap gap-3">
        {d.needsRating ? (
          <Button onClick={() => setRateOpen(true)}>
            <Star className="h-4 w-4" aria-hidden /> Rate {name}
          </Button>
        ) : null}
        <Button asChild variant="secondary">
          <Link href={`/listings/${d.listing.id}`}>View listing</Link>
        </Button>
        {d.canCancel ? (
          <Button variant="destructive" onClick={() => setCancelOpen(true)}>
            Cancel order
          </Button>
        ) : null}
        {d.canReport ? (
          <Button variant="link" className="text-muted" onClick={() => setReportOpen(true)}>
            <Flag className="h-4 w-4" aria-hidden /> Report a problem
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
        body="Dibs Protect returns the held payment to the buyer and the listing goes back on Browse."
        confirmLabel="Cancel order"
        pendingLabel="Cancelling…"
        pending={cancel.pending}
        error={
          cancel.error
            ? messageFor(cancel.error, {
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
      <ReportSheet
        open={reportOpen}
        onOpenChange={setReportOpen}
        title="Report a problem"
        note="Reporting pauses the payment while our team reviews it."
        pending={report.pending}
        error={report.error ? report.error.message : null}
        onSubmit={async (reason, details) => {
          const r = await report.run(o.id, reason, details);
          if (r?.ok) {
            setReportOpen(false);
            toast.success('Report sent. Payment is paused while we review.');
            retry();
          }
        }}
      />
      <RatingSheet
        open={rateOpen}
        onOpenChange={setRateOpen}
        name={name}
        pending={rate.pending}
        error={rate.error ? messageFor(rate.error, { CONFLICT: 'You already rated this order.' }) : null}
        onSubmit={async (stars, tags) => {
          const r = await rate.run(o.id, d.counterpart.id, stars, tags);
          if (r?.ok) {
            setRateOpen(false);
            toast.success('Thanks for rating');
            setData({ ...d, needsRating: false });
          }
        }}
      />
    </div>
  );
}
