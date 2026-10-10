'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { CalendarX, CheckCircle2, ChevronLeft, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { QuoteLines } from '@/components/listing/quote-lines';
import { EmptyState, ErrorState } from '@/components/states';
import { ConsignmentTermsAgreement } from '@/components/summer-hold/consignment-terms';
import { ItemsEditor, blankItem, itemsComplete } from '@/components/summer-hold/items-editor';
import { SlotPicker } from '@/components/summer-hold/slot-picker';
import { Button } from '@/components/ui/button';
import { Field, FormError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Stepper } from '@/components/ui/stepper';
import { choosePickupSlot, createBooking, payDeposit } from '@/lib/actions/summerHold';
import { HOUSING_TYPES } from '@/lib/config/app';
import { formatMoney, formatWindow } from '@/lib/format';
import { useAction, useQuery } from '@/lib/hooks';
import { getSummerHoldQuote } from '@/lib/queries/pricing';
import { getPickupSlots } from '@/lib/queries/summerHold';
import { getSettings } from '@/lib/queries/users';
import { getConsignmentTerms } from '@/lib/queries/consignment';
import { messageFor, ok } from '@/lib/result';
import type { HousingType, Quote, SlotView, StorageItemInput } from '@/lib/types';
import { cn } from '@/lib/utils';

const STEPS = ['Where', 'Items', 'Quote', 'Pickup', 'Deposit'];
const ERRORS = {
  SLOT_FULL: 'That window just filled up. Pick another one.',
  PAYMENT_FAILED: 'Your card was declined. Try another card.',
  DEADLINE_PASSED: 'Booking for this summer has closed.',
  VALIDATION: 'Some details need another look.',
};
const idle = <T,>(v: T) => Promise.resolve(ok(v));

export default function BookSummerHoldPage() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [housing, setHousing] = useState<HousingType | ''>('');
  const [address, setAddress] = useState('');
  const [items, setItems] = useState<StorageItemInput[]>([blankItem()]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const selling = items.some((i) => i.disposition === 'sell');
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const settings = useQuery(() => getSettings(), []);
  const terms = useQuery(() => getConsignmentTerms(), []);
  useEffect(() => {
    if (settings.state.status === 'data' && settings.state.data.housingType && !housing)
      setHousing(settings.state.data.housingType);
  }, [settings.state, housing]);

  const needsQuote = step >= 2 && housing !== '';
  const quote = useQuery(
    () =>
      needsQuote && housing ? getSummerHoldQuote(items, housing) : idle<Quote>({ lines: [], totalCents: 0 }),
    [needsQuote],
  );
  const slots = useQuery(() => (step >= 3 ? getPickupSlots() : idle<SlotView[]>([])), [step >= 3]);

  const create = useAction(createBooking);
  const choose = useAction(choosePickupSlot);
  const pay = useAction(payDeposit);
  const serverError = create.error ?? choose.error ?? pay.error;
  const minPrice = terms.state.status === 'data' ? terms.state.data.minAskingPriceCents : undefined;
  const errors = {
    ...ERRORS,
    ...(selling && minPrice !== undefined
      ? {
          VALIDATION: `Check your items. Items to sell need an asking price of at least ${formatMoney(minPrice)}.`,
        }
      : {}),
  };

  const valid = [
    housing !== '' && address.trim() !== '',
    itemsComplete(items) && (!selling || termsAccepted),
    quote.state.status === 'data',
    slotId !== null,
    true,
  ];

  const advance = async () => {
    setTouched(true);
    if (!valid[step]) return;
    if (step === 1 && housing) {
      const r = await create.run({
        housingType: housing,
        address,
        items,
        consignmentTermsAccepted: selling && termsAccepted,
      });
      if (!r?.ok) return;
      setBookingId(r.data.id);
    }
    if (step === 3 && bookingId && slotId) {
      const r = await choose.run(bookingId, slotId);
      if (!r?.ok) {
        if (r?.error.code === 'SLOT_FULL') {
          setSlotId(null);
          setTouched(false);
          slots.retry();
        }
        return;
      }
    }
    if (step === 4 && bookingId) {
      const r = await pay.run(bookingId);
      if (!r?.ok) return;
      toast.success('Deposit paid. Your pickup is booked.');
      setDone(true);
      return;
    }
    setTouched(false);
    setStep((s) => s + 1);
  };

  const pending = create.pending || choose.pending || pay.pending;
  const chosenSlot =
    slots.state.status === 'data' ? slots.state.data.find((s) => s.id === slotId) : undefined;

  if (done) {
    return (
      <div className="container flex max-w-[640px] flex-col items-center gap-4 py-16 text-center">
        <CheckCircle2 className="h-14 w-14 text-success" aria-hidden />
        <h1 className="text-4xl font-extrabold">You’re booked.</h1>
        <p className="text-muted">
          {chosenSlot ? `Pickup: ${formatWindow(chosenSlot.startsAt, chosenSlot.endsAt)}. ` : null}
          We’ll text you when the driver is on the way.
        </p>
        {selling ? (
          <p className="text-muted">
            Items you’re selling get listed after check-in.{' '}
            <Link href="/summer-hold/consigned" className="font-semibold text-rind">
              Track them in Consigned items
            </Link>
            .
          </p>
        ) : null}
        <Button asChild size="lg">
          <Link href="/summer-hold/booking">View my booking</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container flex max-w-[760px] flex-col gap-6 py-8 md:py-12">
      <PageHeader title="Book Summer Hold" />
      <Stepper steps={STEPS} current={step} />

      <form
        noValidate
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          void advance();
        }}
      >
        <h2 className="text-2xl font-bold">{STEPS[step]}</h2>

        {step === 0 ? (
          <>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-semibold">Where do you live?</legend>
              <div className="grid gap-2 md:grid-cols-2">
                {HOUSING_TYPES.map((h) => (
                  <label
                    key={h.id}
                    className={cn(
                      'flex min-h-[48px] cursor-pointer items-center gap-3 rounded-input border px-3',
                      housing === h.id ? 'border-grove bg-success-bg' : 'border-line bg-surface',
                    )}
                  >
                    <input
                      type="radio"
                      name="housing"
                      className="h-5 w-5 accent-[var(--grove)]"
                      checked={housing === h.id}
                      onChange={() => setHousing(h.id)}
                    />{' '}
                    {h.label}
                  </label>
                ))}
              </div>
              {touched && !housing ? (
                <p role="alert" className="text-sm text-error">
                  Pick your housing type.
                </p>
              ) : null}
            </fieldset>
            <Field
              id="address"
              label="Pickup address"
              hint="Building and room or unit number."
              error={touched && !address.trim() ? 'Add your pickup address.' : null}
            >
              <Input
                id="address"
                autoComplete="street-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                aria-invalid={touched && !address.trim()}
                aria-describedby="address-msg"
              />
            </Field>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <ItemsEditor items={items} onChange={setItems} showErrors={touched} minPriceCents={minPrice} />
            {selling ? (
              terms.state.status === 'loading' ? (
                <Skeleton className="h-48 rounded-card" />
              ) : terms.state.status === 'error' ? (
                <ErrorState message={terms.state.error.message} onRetry={terms.retry} />
              ) : (
                <ConsignmentTermsAgreement
                  terms={terms.state.data}
                  accepted={termsAccepted}
                  onAccept={setTermsAccepted}
                  showError={touched}
                />
              )
            ) : null}
          </>
        ) : null}

        {step === 2 ? (
          quote.state.status === 'loading' ? (
            <Skeleton className="h-40 rounded-card" />
          ) : quote.state.status === 'error' ? (
            <ErrorState message={quote.state.error.message} onRetry={quote.retry} />
          ) : (
            <>
              <QuoteLines quote={quote.state.data} />
              <p className="text-sm text-muted">
                The deposit is due today. The balance is due before pickup.
              </p>
            </>
          )
        ) : null}

        {step === 3 ? (
          slots.state.status === 'loading' ? (
            <div className="grid grid-cols-2 gap-2" aria-busy="true" aria-label="Loading">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-input" />
              ))}
            </div>
          ) : slots.state.status === 'error' ? (
            <ErrorState message={slots.state.error.message} onRetry={slots.retry} />
          ) : slots.state.data.length === 0 ? (
            <EmptyState
              icon={CalendarX}
              text="No pickup windows are open yet."
              actionLabel="Check again"
              onAction={slots.retry}
            />
          ) : (
            <>
              <SlotPicker slots={slots.state.data} value={slotId} onChange={setSlotId} name="pickup" />
              {touched && !slotId ? (
                <p role="alert" className="text-sm text-error">
                  Pick a pickup window.
                </p>
              ) : null}
            </>
          )
        ) : null}

        {step === 4 ? (
          <>
            {quote.state.status === 'data' ? <QuoteLines quote={quote.state.data} /> : null}
            {chosenSlot ? <p>Pickup: {formatWindow(chosenSlot.startsAt, chosenSlot.endsAt)}</p> : null}
            <p className="flex items-start gap-2 text-sm text-muted">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden /> Dibs Protect holds
              your deposit. Cancel before the deadline for a refund.
            </p>
          </>
        ) : null}

        <FormError message={serverError ? messageFor(serverError, errors) : null} />

        <div className="flex justify-between gap-3 border-t border-line pt-4">
          <Button variant="secondary" disabled={step === 0 || pending} onClick={() => setStep((s) => s - 1)}>
            <ChevronLeft className="h-4 w-4" aria-hidden /> Back
          </Button>
          <Button type="submit" variant={step === 4 ? 'dibs' : 'default'} disabled={pending}>
            {pending ? 'Working…' : step === 4 ? 'Pay deposit' : step === 3 ? 'Hold this window' : 'Next'}
          </Button>
        </div>
      </form>
    </div>
  );
}
