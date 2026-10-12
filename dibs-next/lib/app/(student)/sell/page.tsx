'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { ListingPreview } from '@/components/sell/listing-preview';
import { PhotoOrderer } from '@/components/sell/photo-orderer';
import { ProhibitedNotice } from '@/components/sell/prohibited-notice';
import { Button } from '@/components/ui/button';
import { Field, FormError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Stepper } from '@/components/ui/stepper';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { publishListing, saveListingDraft } from '@/lib/actions/listings';
import { CATEGORIES, CONDITIONS, HOUSING_FITS } from '@/lib/config/app';
import { formatMoney, formatTime } from '@/lib/format';
import { useAction, useQuery } from '@/lib/hooks';
import { useTimeZone } from '@/lib/campus';
import { getSellerPayoutQuote } from '@/lib/queries/pricing';
import { ok } from '@/lib/result';
import { QuoteLines } from '@/components/listing/quote-lines';
import { ErrorState, LoadingBlock } from '@/components/states';
import type { Quote } from '@/lib/types';
import type { ListingDraftInput } from '@/lib/types';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/errorMessages';

const STEPS = ['Photos', 'Details', 'Price', 'Review'];
const PRICE_RE = /^\d+(\.\d{1,2})?$/;
const SELL_ERRORS = {
  VALIDATION: 'Some details need another look. Check each step.',
  RATE_LIMITED: 'You have posted a lot today. Try again tomorrow.',
};

const EMPTY: ListingDraftInput = {
  photos: [],
  title: '',
  category: '',
  condition: '',
  housingFit: '',
  description: '',
  priceCents: null,
};

export default function SellPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ListingDraftInput>(EMPTY);
  const [draftId, setDraftId] = useState<string | undefined>();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [notProhibited, setNotProhibited] = useState(false);
  const [dollars, setDollars] = useState('');
  const [free, setFree] = useState(false);
  const [touched, setTouched] = useState(false);
  const save = useAction(saveListingDraft);
  const publish = useAction(publishListing);

  const set = (patch: Partial<ListingDraftInput>) => setDraft((d) => ({ ...d, ...patch }));
  const priceInvalid = !free && dollars !== '' && !PRICE_RE.test(dollars);
  const tz = useTimeZone();

  // The payout quote follows the price, a moment after typing stops.
  const [quoteCents, setQuoteCents] = useState<number | null>(null);
  useEffect(() => {
    const cents = free ? 0 : PRICE_RE.test(dollars) ? Math.round(Number(dollars) * 100) : null;
    const t = setTimeout(() => setQuoteCents(cents), 350);
    return () => clearTimeout(t);
  }, [dollars, free]);
  const payout = useQuery(
    () => (quoteCents === null ? Promise.resolve(ok<Quote | null>(null)) : getSellerPayoutQuote(quoteCents)),
    [quoteCents],
  );

  // Client checks only: required fields and formats. Everything else is the backend's call.
  const stepValid = [
    draft.photos.length > 0,
    draft.title.trim() !== '' &&
      draft.category !== '' &&
      draft.condition !== '' &&
      draft.housingFit !== '' &&
      notProhibited,
    free || (dollars !== '' && !priceInvalid),
    true,
  ];

  const withPrice = (): ListingDraftInput => ({
    ...draft,
    priceCents: free ? 0 : dollars ? Math.round(Number(dollars) * 100) : null,
  });

  const saveDraft = async () => {
    const r = await save.run(withPrice(), draftId);
    if (r?.ok) {
      setDraftId(r.data.id);
      setSavedAt(r.data.savedAt);
      toast.success('Draft saved');
    }
    return r;
  };

  const next = () => {
    setTouched(true);
    if (stepValid[step]) {
      setTouched(false);
      setStep((s) => s + 1);
    }
  };

  const err = (cond: boolean, msg: string) => (touched && cond ? msg : null);
  const serverError = save.error ?? publish.error;

  return (
    <div className="container flex max-w-[760px] flex-col gap-6 py-8 md:py-12">
      <PageHeader
        title="Sell an item"
        actions={
          <Button variant="secondary" disabled={save.pending} onClick={saveDraft}>
            <Save className="h-4 w-4" aria-hidden /> {save.pending ? 'Saving…' : 'Save draft'}
          </Button>
        }
      />
      <Stepper steps={STEPS} current={step} />
      {savedAt ? (
        <p className="text-sm text-muted" aria-live="polite">
          Draft saved at {formatTime(savedAt, tz)}
        </p>
      ) : null}

      <form
        className="flex flex-col gap-5"
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();
          if (step < 3) return next();
          const s = await saveDraft();
          if (!s?.ok) return;
          const r = await publish.run(s.data.id);
          if (r?.ok) {
            toast.success('Listed! Students can call dibs now.');
            router.push(`/listings/${r.data.id}`);
          }
        }}
      >
        <h2 className="text-2xl font-bold">{STEPS[step]}</h2>

        {step === 0 ? (
          <>
            <PhotoOrderer photos={draft.photos} onChange={(photos) => set({ photos })} />
            {err(!stepValid[0], 'Add at least one photo.') ? (
              <p role="alert" className="text-sm text-error">
                Add at least one photo.
              </p>
            ) : null}
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Field id="title" label="Title" error={err(!draft.title.trim(), 'Add a title.')}>
              <Input
                id="title"
                value={draft.title}
                maxLength={80}
                onChange={(e) => set({ title: e.target.value })}
                aria-invalid={Boolean(err(!draft.title.trim(), 'x'))}
                aria-describedby="title-msg"
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field id="category" label="Category" error={err(!draft.category, 'Pick a category.')}>
                <NativeSelect
                  id="category"
                  value={draft.category}
                  onChange={(e) => set({ category: e.target.value as ListingDraftInput['category'] })}
                  aria-describedby="category-msg"
                >
                  <option value="">Choose…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field id="condition" label="Condition" error={err(!draft.condition, 'Pick a condition.')}>
                <NativeSelect
                  id="condition"
                  value={draft.condition}
                  onChange={(e) => set({ condition: e.target.value as ListingDraftInput['condition'] })}
                  aria-describedby="condition-msg"
                >
                  <option value="">Choose…</option>
                  {CONDITIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            </div>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-semibold">Housing fit</legend>
              {HOUSING_FITS.map((h) => (
                <label
                  key={h.id}
                  className={cn(
                    'flex min-h-[48px] cursor-pointer items-start gap-3 rounded-input border p-3',
                    draft.housingFit === h.id ? 'border-grove bg-success-bg' : 'border-line bg-surface',
                  )}
                >
                  <input
                    type="radio"
                    name="fit"
                    className="mt-1 h-5 w-5 accent-[var(--grove)]"
                    checked={draft.housingFit === h.id}
                    onChange={() => set({ housingFit: h.id })}
                  />
                  <span className="flex flex-col">
                    <span className="font-semibold">{h.label}</span>
                    <span className="text-sm text-muted">{h.explain}</span>
                  </span>
                </label>
              ))}
              {err(!draft.housingFit, 'x') ? (
                <p role="alert" className="text-sm text-error">
                  Pick where this item fits.
                </p>
              ) : null}
            </fieldset>
            <Field id="desc" label="Description" hint="Size, flaws, pickup notes.">
              <Textarea
                id="desc"
                rows={4}
                value={draft.description}
                onChange={(e) => set({ description: e.target.value })}
                aria-describedby="desc-msg"
              />
            </Field>
            <ProhibitedNotice confirmed={notProhibited} onConfirm={setNotProhibited} />
            {err(!notProhibited, 'x') ? (
              <p role="alert" className="text-sm text-error">
                Confirm your item is allowed.
              </p>
            ) : null}
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div className="flex min-h-[44px] items-center gap-3">
              <Switch id="free" checked={free} onCheckedChange={setFree} />
              <Label htmlFor="free">Give it away free</Label>
            </div>
            {!free ? (
              <Field
                id="price"
                label="Asking price ($)"
                error={
                  priceInvalid
                    ? 'Enter an amount like 25 or 25.50.'
                    : err(dollars === '', 'Add a price or turn on Free.')
                }
                hint="Buyers see the total, including any fees, before they pay."
              >
                <Input
                  id="price"
                  inputMode="decimal"
                  value={dollars}
                  onChange={(e) => setDollars(e.target.value)}
                  aria-invalid={priceInvalid}
                  aria-describedby="price-msg"
                  className="tabular max-w-[200px] text-2xl font-semibold"
                />
              </Field>
            ) : null}
            <section aria-label="Your payout" className="flex flex-col gap-2">
              {payout.state.status === 'loading' ? (
                <LoadingBlock className="h-28 rounded-card" />
              ) : payout.state.status === 'error' ? (
                <ErrorState message={errorMessage(payout.state.error)} onRetry={payout.retry} />
              ) : payout.state.data === null ? (
                <p className="rounded-card bg-sunk p-4 text-sm text-muted">
                  Enter a price to see what you receive.
                </p>
              ) : (
                <>
                  <p className="tabular text-xl font-bold" aria-live="polite">
                    You receive {formatMoney(payout.state.data.totalCents)}
                  </p>
                  <QuoteLines quote={payout.state.data} totalLabel="You receive" />
                </>
              )}
            </section>
          </>
        ) : null}

        {step === 3 ? <ListingPreview draft={withPrice()} /> : null}

        <FormError message={serverError ? errorMessage(serverError, SELL_ERRORS) : null} />

        <div className="flex justify-between gap-3 border-t border-line pt-4">
          <Button variant="secondary" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            <ChevronLeft className="h-4 w-4" aria-hidden /> Back
          </Button>
          {step < 3 ? (
            <Button type="submit">
              Next <ChevronRight className="h-4 w-4" aria-hidden />
            </Button>
          ) : (
            <Button type="submit" variant="dibs" disabled={save.pending || publish.pending}>
              {publish.pending || save.pending ? 'Publishing…' : 'Publish listing'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
