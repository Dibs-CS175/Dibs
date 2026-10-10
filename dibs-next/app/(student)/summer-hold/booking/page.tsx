'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Archive, CalendarX, MapPin, Pencil } from 'lucide-react';
import { ConfirmSheet } from '@/components/confirm-sheet';
import { PageHeader } from '@/components/layout/page-header';
import { QuoteLines } from '@/components/listing/quote-lines';
import { EmptyState, ErrorState, PageSkeleton } from '@/components/states';
import { BookingTracker } from '@/components/summer-hold/booking-tracker';
import { ConsignmentTermsAgreement } from '@/components/summer-hold/consignment-terms';
import { ItemsEditor, itemsComplete } from '@/components/summer-hold/items-editor';
import { SlotPicker } from '@/components/summer-hold/slot-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { cancelBooking, chooseReturnSlot, payBalance, updateBookingItems } from '@/lib/actions/summerHold';
import { HOUSING_TYPES } from '@/lib/config/app';
import { formatDateTime, formatMoney, formatWindow, labelFor } from '@/lib/format';
import { useAction, useQuery } from '@/lib/hooks';
import { getConsignmentTerms } from '@/lib/queries/consignment';
import { getMyBooking, getReturnSlots } from '@/lib/queries/summerHold';
import { messageFor, ok } from '@/lib/result';
import type { SlotView, StorageItemInput } from '@/lib/types';

const ERRORS = {
  DEADLINE_PASSED: 'The deadline for changes has passed.',
  VALIDATION: 'Check your items. Items to sell need an asking price at or above the minimum.',
  CONFLICT: 'One of these items already sold, so it can no longer be changed.',
  SLOT_FULL: 'That window just filled up. Pick another one.',
  PAYMENT_FAILED: 'Your card was declined. Try another card.',
};

export default function MyBookingPage() {
  const { state, retry, setData } = useQuery(() => getMyBooking(), []);
  const [editing, setEditing] = useState(false);
  const [draftItems, setDraftItems] = useState<StorageItemInput[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const terms = useQuery(() => getConsignmentTerms(), []);
  const draftSelling = draftItems.some((i) => i.disposition === 'sell');
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnId, setReturnId] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const returnSlots = useQuery(
    () => (returnOpen ? getReturnSlots() : Promise.resolve(ok<SlotView[]>([]))),
    [returnOpen],
  );
  const saveItems = useAction(updateBookingItems);
  const chooseReturn = useAction(chooseReturnSlot);
  const pay = useAction(payBalance);
  const cancel = useAction(cancelBooking);

  if (state.status === 'loading') return <PageSkeleton />;
  if (state.status === 'error') {
    return (
      <div className="container max-w-content py-16">
        <ErrorState message={state.error.message} onRetry={retry} />
      </div>
    );
  }
  if (state.data === null) {
    return (
      <div className="container max-w-content py-16">
        <EmptyState
          icon={Archive}
          text="You don’t have a Summer Hold booking yet."
          actionLabel="Book a pickup"
          href="/summer-hold/book"
        />
      </div>
    );
  }

  const mb = state.data;
  const b = mb.booking;
  const active = b.status !== 'cancelled';

  return (
    <div className="container flex max-w-[760px] flex-col gap-8 py-8 md:py-12">
      <PageHeader
        title="My Summer Hold"
        subtitle={`${labelFor(HOUSING_TYPES, b.housingType)} · ${b.address}`}
      />

      <section aria-labelledby="status-h" className="flex flex-col gap-3">
        <h2 id="status-h" className="text-xl font-bold">
          Status
        </h2>
        <BookingTracker status={b.status} />
      </section>

      <section aria-labelledby="pickup-h" className="flex flex-col gap-3">
        <h2 id="pickup-h" className="text-xl font-bold">
          Pickup and return
        </h2>
        <p className="flex items-start gap-2">
          <MapPin className="mt-1 h-4 w-4 shrink-0" aria-hidden />
          <span>
            <strong>Pickup:</strong>{' '}
            {mb.pickupSlot ? formatWindow(mb.pickupSlot.startsAt, mb.pickupSlot.endsAt) : 'Not chosen'}
          </span>
        </p>
        <p className="flex items-start gap-2">
          <MapPin className="mt-1 h-4 w-4 shrink-0" aria-hidden />
          <span>
            <strong>Return:</strong>{' '}
            {mb.returnSlot ? formatWindow(mb.returnSlot.startsAt, mb.returnSlot.endsAt) : 'Not chosen yet'}
          </span>
        </p>
        {active ? (
          <Button
            variant="secondary"
            className="w-fit"
            onClick={() => setReturnOpen((o) => !o)}
            aria-expanded={returnOpen}
          >
            {mb.returnSlot ? 'Change return window' : 'Choose return window'}
          </Button>
        ) : null}
        {returnOpen ? (
          <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
            {returnSlots.state.status === 'loading' ? (
              <Skeleton className="h-32 rounded-input" />
            ) : returnSlots.state.status === 'error' ? (
              <ErrorState message={returnSlots.state.error.message} onRetry={returnSlots.retry} />
            ) : returnSlots.state.data.length === 0 ? (
              <EmptyState
                icon={CalendarX}
                text="Return windows open in August."
                actionLabel="Close"
                onAction={() => setReturnOpen(false)}
              />
            ) : (
              <>
                <SlotPicker
                  slots={returnSlots.state.data}
                  value={returnId}
                  onChange={setReturnId}
                  name="return"
                />
                <FormError message={chooseReturn.error ? messageFor(chooseReturn.error, ERRORS) : null} />
                <Button
                  className="w-fit"
                  disabled={!returnId || chooseReturn.pending}
                  onClick={async () => {
                    if (!returnId) return;
                    const r = await chooseReturn.run(b.id, returnId);
                    if (r?.ok) {
                      setData(r.data);
                      setReturnOpen(false);
                      toast.success('Return window saved');
                    } else if (r?.error.code === 'SLOT_FULL') {
                      setReturnId(null);
                      returnSlots.retry();
                    }
                  }}
                >
                  {chooseReturn.pending ? 'Saving…' : 'Save return window'}
                </Button>
              </>
            )}
          </div>
        ) : null}
      </section>

      <section aria-labelledby="items-h" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="items-h" className="text-xl font-bold">
            Items
          </h2>
          {mb.canEditItems && !editing ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setDraftItems(
                  b.items.map((i) => ({
                    label: i.label,
                    size: i.size,
                    disposition: i.disposition,
                    askingPriceCents: i.askingPriceCents ?? null,
                  })),
                );
                setTermsAccepted(false);
                setEditing(true);
              }}
            >
              <Pencil className="h-4 w-4" aria-hidden /> Edit items
            </Button>
          ) : null}
        </div>
        <p className="text-sm text-muted">
          {mb.canEditItems
            ? `You can change items until ${formatDateTime(mb.itemEditDeadline)}.`
            : `Item changes closed ${formatDateTime(mb.itemEditDeadline)}.`}
        </p>
        {editing ? (
          <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
            <ItemsEditor
              items={draftItems}
              onChange={setDraftItems}
              showErrors
              minPriceCents={terms.state.status === 'data' ? terms.state.data.minAskingPriceCents : undefined}
            />
            {draftSelling ? (
              terms.state.status === 'data' ? (
                <ConsignmentTermsAgreement
                  terms={terms.state.data}
                  accepted={termsAccepted}
                  onAccept={setTermsAccepted}
                />
              ) : terms.state.status === 'error' ? (
                <ErrorState message={terms.state.error.message} onRetry={terms.retry} />
              ) : (
                <Skeleton className="h-40 rounded-card" />
              )
            ) : null}
            <FormError message={saveItems.error ? messageFor(saveItems.error, ERRORS) : null} />
            <div className="flex gap-2">
              <Button
                disabled={saveItems.pending || !itemsComplete(draftItems) || (draftSelling && !termsAccepted)}
                onClick={async () => {
                  const r = await saveItems.run(b.id, draftItems, draftSelling && termsAccepted);
                  if (r?.ok) {
                    setData(r.data);
                    setEditing(false);
                    toast.success('Items updated. Your quote was refreshed.');
                  }
                }}
              >
                {saveItems.pending ? 'Saving…' : 'Save items'}
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ul className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface">
              {b.items.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <span className="min-w-0">{i.label}</span>
                  <span className="flex flex-wrap items-center gap-2">
                    {i.disposition === 'sell' ? (
                      <Badge variant="zest">
                        Selling
                        {i.askingPriceCents !== undefined ? ` · ${formatMoney(i.askingPriceCents)}` : ''}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Return in fall</Badge>
                    )}
                    <Badge variant={i.size === 'large' ? 'default' : 'outline'}>
                      {i.size === 'large' ? 'Large' : 'Standard'}
                    </Badge>
                  </span>
                </li>
              ))}
            </ul>
            {b.items.some((i) => i.disposition === 'sell') ? (
              <Link href="/summer-hold/consigned" className="w-fit text-sm font-semibold text-rind">
                Track items you’re selling
              </Link>
            ) : null}
          </>
        )}
      </section>

      <section aria-labelledby="pay-h" className="flex flex-col gap-3">
        <h2 id="pay-h" className="text-xl font-bold">
          Payment
        </h2>
        <QuoteLines quote={b.quote} />
        <p className="text-sm text-muted">Balance due {formatDateTime(b.balanceDueAt)}.</p>
        <FormError message={pay.error ? messageFor(pay.error, ERRORS) : null} />
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

      {mb.canCancel ? (
        <Button variant="destructive" className="w-fit" onClick={() => setCancelOpen(true)}>
          Cancel booking
        </Button>
      ) : null}

      <ConfirmSheet
        open={cancelOpen}
        onOpenChange={(v) => {
          setCancelOpen(v);
          if (!v) cancel.clearError();
        }}
        title="Cancel Summer Hold?"
        body="Your pickup window is released. Refund terms are shown on your receipt."
        confirmLabel="Cancel booking"
        pendingLabel="Cancelling…"
        pending={cancel.pending}
        error={cancel.error ? messageFor(cancel.error, ERRORS) : null}
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
