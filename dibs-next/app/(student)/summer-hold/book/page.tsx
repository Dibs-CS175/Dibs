'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { CalendarX, CheckCircle2, ChevronLeft, Copy, Send, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { QuoteLines } from '@/components/listing/quote-lines';
import { EmptyState, ErrorState, LoadingBlock, PageSkeleton } from '@/components/states';
import {
  AddOnList,
  Counter,
  FullServiceCard,
  TierBanner,
  boxRuleText,
} from '@/components/summer-hold/offer-bits';
import { SlotPicker } from '@/components/summer-hold/slot-picker';
import { Button } from '@/components/ui/button';
import { Field, FormError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Stepper } from '@/components/ui/stepper';
import { createBooking, createParentPayLink, payRegistration } from '@/lib/actions/summerHold';
import { useCampus, useTimeZone } from '@/lib/campus';
import { HOUSING_TYPES } from '@/lib/config/app';
import { errorMessage } from '@/lib/errorMessages';
import { formatMaybeDate } from '@/lib/format';
import { useAction, useQuery } from '@/lib/hooks';
import { offerKey, sendOfferChoices, useOffersShown } from '@/lib/offers';
import { getSummerHoldOffers, getSummerHoldQuote } from '@/lib/queries/pricing';
import { checkReferralCode } from '@/lib/queries/referrals';
import { getPackingSlots } from '@/lib/queries/summerHold';
import { getSettings } from '@/lib/queries/users';
import { ok } from '@/lib/result';
import type {
  AddOnKey,
  HousingType,
  SlotView,
  SummerHoldBooking,
  SummerHoldInput,
  SummerHoldOffers,
} from '@/lib/types';
import { cn } from '@/lib/utils';

const STEPS = ['Where', 'Items', 'Options', 'Review and pay'];

export default function BookSummerHoldPage() {
  const campus = useCampus();
  const tz = useTimeZone();
  const campusId = campus?.id ?? null;
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState(false);
  const [housing, setHousing] = useState<HousingType | ''>('');
  const [address, setAddress] = useState('');
  const [standardCount, setStandardCount] = useState(0);
  const [largeCount, setLargeCount] = useState(0);
  const [fullService, setFullService] = useState(false);
  const [packingSlotId, setPackingSlotId] = useState<string | null>(null);
  const [addOnKeys, setAddOnKeys] = useState<AddOnKey[]>([]);
  const [referralText, setReferralText] = useState('');
  const [referral, setReferral] = useState('');
  const [booking, setBooking] = useState<SummerHoldBooking | null>(null);
  const [paid, setPaid] = useState<SummerHoldBooking | null>(null);
  const [parentLink, setParentLink] = useState<string | null>(null);

  const settings = useQuery(() => getSettings(), []);
  useEffect(() => {
    if (settings.state.status === 'data' && settings.state.data.housingType && !housing)
      setHousing(settings.state.data.housingType);
  }, [settings.state, housing]);

  const offers = useQuery(
    () => (campusId ? getSummerHoldOffers(campusId) : Promise.resolve(ok<SummerHoldOffers | null>(null))),
    [campusId],
  );
  const packing = useQuery(
    () => (campusId && fullService ? getPackingSlots(campusId) : Promise.resolve(ok<SlotView[]>([]))),
    [campusId, fullService],
  );

  // The total follows every choice; the query waits a moment after the last change.
  const input: SummerHoldInput = {
    campusId: campusId ?? '',
    housingType: housing,
    standardCount,
    largeCount,
    fullService,
    addOnKeys,
    referralCode: referral,
  };
  const inputKey = JSON.stringify(input);
  const [quoteKey, setQuoteKey] = useState(inputKey);
  useEffect(() => {
    const t = setTimeout(() => setQuoteKey(inputKey), 300);
    return () => clearTimeout(t);
  }, [inputKey]);
  const quote = useQuery(() => getSummerHoldQuote(JSON.parse(quoteKey) as SummerHoldInput), [quoteKey]);

  const create = useAction(createBooking);
  const pay = useAction(payRegistration);
  const link = useAction(createParentPayLink);
  const refCheck = useAction(checkReferralCode);

  const o = offers.state.status === 'data' ? offers.state.data : null;
  useOffersShown(
    o && step === 2
      ? [offerKey.fullService, ...o.addOns.map((a) => offerKey.addOn(a.key))]
      : o && step === 3
        ? [offerKey.tier(o.currentTier.key)]
        : [],
  );

  // Client checks only: required fields and formats.
  const valid = [
    housing !== '' && address.trim() !== '',
    standardCount + largeCount > 0,
    !fullService || packingSlotId !== null,
    booking !== null,
  ];

  const next = async () => {
    setTouched(true);
    if (!valid[step] || !campusId) return;
    if (step === 2) {
      const r = await create.run({ ...input, address, packingSlotId: fullService ? packingSlotId : null });
      if (!r) return;
      if (!r.ok) {
        if (r.error.code === 'SLOT_FULL') {
          setPackingSlotId(null);
          packing.retry();
        }
        return;
      }
      setBooking(r.data);
    }
    setTouched(false);
    setStep((s) => s + 1);
  };

  if (!campusId || offers.state.status === 'loading') return <PageSkeleton />;
  if (offers.state.status === 'error') {
    return (
      <div className="container max-w-content py-16">
        <ErrorState message={errorMessage(offers.state.error)} onRetry={offers.retry} />
      </div>
    );
  }
  if (!o) {
    return (
      <div className="container max-w-content py-16">
        <EmptyState
          icon={CalendarX}
          text="Summer Hold isn’t open at your campus yet."
          actionLabel="Browse listings"
          href="/browse"
        />
      </div>
    );
  }

  if (paid) {
    return (
      <div className="container flex max-w-[640px] flex-col items-center gap-4 py-16 text-center">
        <CheckCircle2 className="h-14 w-14 text-success" aria-hidden />
        <h1 className="text-4xl font-extrabold">You’re registered.</h1>
        <p className="text-muted">Dibs Protect is holding your registration payment.</p>
        <p>
          Balance due: <strong>{formatMaybeDate(paid.balanceDueAt, tz)}</strong>
        </p>
        <Button asChild size="lg">
          <Link href="/summer-hold/booking">View my booking</Link>
        </Button>
      </div>
    );
  }

  const pending = create.pending || pay.pending;
  const createError = create.error
    ? errorMessage(create.error, {
        SLOT_FULL: 'That packing time just filled up. Pick another one.',
        DEADLINE_PASSED: 'Sign-ups for this summer have closed.',
      })
    : null;

  return (
    <div className="container flex max-w-content flex-col gap-6 py-8 md:py-12">
      <PageHeader title="Sign up for Summer Hold" />
      <Stepper steps={STEPS} current={step} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <form
          noValidate
          className="flex min-w-0 flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            void next();
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
                      />
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
              <Counter
                id="std"
                label="Standard items"
                hint={`Each is ${boxRuleText(o.standardBoxRule)}.`}
                value={standardCount}
                onChange={setStandardCount}
              />
              <Counter
                id="lrg"
                label="Large items"
                hint="Anything bigger: furniture, bikes, mini-fridges."
                value={largeCount}
                onChange={setLargeCount}
              />
              {touched && !valid[1] ? (
                <p role="alert" className="text-sm text-error">
                  Add at least one item.
                </p>
              ) : null}
            </>
          ) : null}

          {step === 2 ? (
            <>
              <FullServiceCard
                cents={o.fullService.cents}
                maxItems={o.fullService.maxItems}
                checked={fullService}
                onChange={setFullService}
              />
              {fullService ? (
                <section aria-labelledby="pack-h" className="flex flex-col gap-3">
                  <h3 id="pack-h" className="font-sans text-base font-bold">
                    Packing appointment
                  </h3>
                  {packing.state.status === 'loading' ? (
                    <LoadingBlock className="h-32 rounded-card" />
                  ) : packing.state.status === 'error' ? (
                    <ErrorState message={errorMessage(packing.state.error)} onRetry={packing.retry} />
                  ) : packing.state.data.length === 0 ? (
                    <EmptyState
                      icon={CalendarX}
                      text="No packing appointments are open yet."
                      actionLabel="Check again"
                      onAction={packing.retry}
                    />
                  ) : (
                    <SlotPicker
                      slots={packing.state.data}
                      value={packingSlotId}
                      onChange={setPackingSlotId}
                      name="packing"
                    />
                  )}
                  {touched && !packingSlotId ? (
                    <p role="alert" className="text-sm text-error">
                      Pick a packing time, or turn off Full Service.
                    </p>
                  ) : null}
                </section>
              ) : null}
              <AddOnList addOns={o.addOns} value={addOnKeys} onChange={setAddOnKeys} />
              <FormError message={createError} />
            </>
          ) : null}

          {step === 3 ? (
            <>
              <TierBanner tier={o.currentTier} cancelWindowDays={o.cancelWindowDays} />
              <div className="flex flex-col gap-1">
                <Field
                  id="ref"
                  label="Referral code (optional)"
                  error={refCheck.error ? errorMessage(refCheck.error) : null}
                  hint={referral ? `Applied: ${referral}` : undefined}
                >
                  <div className="flex gap-2">
                    <Input
                      id="ref"
                      value={referralText}
                      onChange={(e) => setReferralText(e.target.value)}
                      aria-describedby="ref-msg"
                      className="max-w-[220px] font-mono uppercase"
                    />
                    <Button
                      variant="secondary"
                      disabled={!referralText.trim() || refCheck.pending}
                      onClick={async () => {
                        const r = await refCheck.run(referralText);
                        if (r?.ok) {
                          setReferral(r.data.code);
                          toast.success(r.data.description);
                        }
                      }}
                    >
                      {refCheck.pending ? 'Checking…' : 'Apply'}
                    </Button>
                  </div>
                </Field>
              </div>

              <div className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4">
                <p className="font-semibold">Someone else paying?</p>
                <p className="text-sm text-muted">Send a link. They can pay without signing in.</p>
                {parentLink ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="break-all rounded-input bg-sunk px-2 py-1 text-sm">{parentLink}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(parentLink);
                          toast.success('Link copied');
                        } catch {
                          toast.error('Copy the link by selecting it.');
                        }
                      }}
                    >
                      <Copy className="h-4 w-4" aria-hidden /> Copy
                    </Button>
                    {typeof navigator !== 'undefined' && 'share' in navigator ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          void navigator
                            .share({ title: 'Summer Hold payment', url: parentLink })
                            .catch(() => undefined)
                        }
                      >
                        <Send className="h-4 w-4" aria-hidden /> Share
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-fit"
                    disabled={!booking || link.pending}
                    onClick={async () => {
                      if (!booking) return;
                      const r = await link.run(booking.id);
                      if (r?.ok) setParentLink(`${window.location.origin}${r.data.path}`);
                    }}
                  >
                    <Send className="h-4 w-4" aria-hidden />{' '}
                    {link.pending ? 'Creating link…' : 'Send to a parent'}
                  </Button>
                )}
                <FormError message={link.error ? errorMessage(link.error) : null} />
              </div>

              <p className="flex items-start gap-2 text-sm text-muted">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden /> Dibs Protect
                holds your registration payment.
              </p>
              <FormError
                message={
                  pay.error
                    ? errorMessage(pay.error, {
                        DEADLINE_PASSED: 'Registration for this summer has closed.',
                        REFERRAL_INVALID: 'That referral code can’t be used. Remove it and try again.',
                      })
                    : null
                }
              />
            </>
          ) : null}

          <div className="flex justify-between gap-3 border-t border-line pt-4">
            <Button
              variant="secondary"
              disabled={step === 0 || pending}
              onClick={() => setStep((s) => s - 1)}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden /> Back
            </Button>
            {step < 3 ? (
              <Button type="submit" disabled={pending}>
                {create.pending ? 'Saving…' : 'Next'}
              </Button>
            ) : (
              <Button
                variant="dibs"
                disabled={pending || !booking}
                onClick={async () => {
                  if (!booking) return;
                  const r = await pay.run(booking.id, referral);
                  if (r?.ok) {
                    sendOfferChoices([
                      { offerKey: offerKey.tier(o.currentTier.key), chosen: true },
                      { offerKey: offerKey.fullService, chosen: fullService },
                      ...o.addOns.map((a) => ({
                        offerKey: offerKey.addOn(a.key),
                        chosen: addOnKeys.includes(a.key),
                      })),
                    ]);
                    setPaid(r.data);
                  }
                }}
              >
                {pay.pending ? 'Paying…' : 'Pay registration'}
              </Button>
            )}
          </div>
        </form>

        <aside
          aria-label="Your total"
          className="flex flex-col gap-2 lg:sticky lg:top-[calc(var(--header-h)+16px)] lg:self-start"
        >
          <h2 className="text-lg font-bold">Your total</h2>
          {quote.state.status === 'loading' ? (
            <LoadingBlock className="h-32 rounded-card" />
          ) : quote.state.status === 'error' ? (
            <ErrorState message={errorMessage(quote.state.error)} onRetry={quote.retry} />
          ) : (
            <QuoteLines quote={quote.state.data} />
          )}
          <p className="text-xs text-muted">All-in: every required fee is included.</p>
        </aside>
      </div>
    </div>
  );
}
