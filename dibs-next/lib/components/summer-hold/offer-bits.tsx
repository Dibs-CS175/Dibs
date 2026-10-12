'use client';

import { Minus, Plus, Sparkles } from 'lucide-react';
import { Countdown } from '@/components/landing/landing';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { formatMoney } from '@/lib/format';
import type { AddOn, AddOnKey, PriceTable, RegistrationTier } from '@/lib/types';
import { cn } from '@/lib/utils';

/** "a box up to 18 x 18 x 24 inches, under 50 lb", from the price table's standardBoxRule. */
export function boxRuleText(rule: PriceTable['standardBoxRule']): string {
  return `a box up to ${rule.maxInches.join(' x ')} inches, under ${rule.maxPounds} lb`;
}

/** Number input with minus and plus buttons. Typing works too. */
export function Counter({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface p-4">
      <div className="flex min-w-0 flex-col">
        <Label htmlFor={id} className="text-base">
          {label}
        </Label>
        <span className="text-sm text-muted">{hint}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="secondary"
          size="icon"
          aria-label={`Fewer ${label.toLowerCase()}`}
          disabled={value <= 0}
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          <Minus className="h-4 w-4" aria-hidden />
        </Button>
        <input
          id={id}
          inputMode="numeric"
          value={String(value)}
          onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, '') || 0))}
          className="tabular h-11 w-14 rounded-input border border-line bg-surface text-center text-lg font-semibold"
        />
        <Button
          variant="secondary"
          size="icon"
          aria-label={`More ${label.toLowerCase()}`}
          onClick={() => onChange(value + 1)}
        >
          <Plus className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

/** Full Service card. Price and item limit come from getSummerHoldOffers. */
export function FullServiceCard({
  cents,
  maxItems,
  checked,
  onChange,
}: {
  cents: number;
  maxItems: number;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer flex-col gap-2 rounded-card border-2 p-4 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-navel',
        checked ? 'border-grove bg-success-bg' : 'border-line bg-surface',
      )}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-2 font-display text-xl font-bold">
          <Sparkles className="h-5 w-5 text-rind" aria-hidden /> Full Service
        </span>
        <input
          type="checkbox"
          className="mt-1 h-5 w-5 accent-[var(--grove)]"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
      </span>
      <span>Dibs packs up to {maxItems} items for you.</span>
      <span className="tabular font-semibold">{formatMoney(cents)}</span>
    </label>
  );
}

/** Optional add-ons, all unchecked until the student picks them. */
export function AddOnList({
  addOns,
  value,
  onChange,
}: {
  addOns: AddOn[];
  value: AddOnKey[];
  onChange: (v: AddOnKey[]) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 font-semibold">Add-ons (optional)</legend>
      {addOns.map((a) => {
        const on = value.includes(a.key);
        return (
          <div
            key={a.key}
            className={cn(
              'flex items-start gap-3 rounded-card border p-4',
              on ? 'border-grove bg-success-bg' : 'border-line bg-surface',
            )}
          >
            <Checkbox
              id={`addon-${a.key}`}
              checked={on}
              onCheckedChange={(v) =>
                onChange(v === true ? [...value, a.key] : value.filter((k) => k !== a.key))
              }
              className="mt-1"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <Label htmlFor={`addon-${a.key}`} className="flex flex-wrap justify-between gap-2 text-base">
                <span>{a.label}</span>
                <span className="tabular">{formatMoney(a.cents)}</span>
              </Label>
              <span className="text-sm text-muted">{a.note}</span>
            </div>
          </div>
        );
      })}
    </fieldset>
  );
}

/** Current registration tier with its price, a countdown to its end, and the cancel window. */
export function TierBanner({ tier, cancelWindowDays }: { tier: RegistrationTier; cancelWindowDays: number }) {
  return (
    <section
      aria-label="Registration"
      className="flex flex-col gap-3 rounded-card bg-grove p-4 text-on-grove md:flex-row md:items-center md:justify-between"
    >
      <div className="flex flex-col gap-1">
        <p className="font-display text-xl font-bold">
          {tier.label}: <span className="tabular">{formatMoney(tier.cents)}</span>
        </p>
        <p className="text-sm text-white/85">
          Free cancellation for {cancelWindowDays} days after you register, then registration is
          non-refundable.
        </p>
      </div>
      {tier.endsAt ? (
        <div className="text-ink [&_div.rounded-card]:bg-white/15">
          <Countdown to={tier.endsAt} label={`until ${tier.label} ends`} />
        </div>
      ) : (
        <p className="text-sm text-white/85">Tier dates are coming soon.</p>
      )}
    </section>
  );
}
