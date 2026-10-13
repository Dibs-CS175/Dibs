'use client';

import { SlidersHorizontal } from 'lucide-react';
import { NamedIcon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { CATEGORIES, CONDITIONS, HOUSING_FITS } from '@/lib/config/app';
import type { Category, Condition, HousingFit, ListingSearch, ListingSource } from '@/lib/types';
import { cn } from '@/lib/utils';

/** Price slider range in dollars. A UI bound for the control, not a business value. */
const SLIDER_MAX_DOLLARS = 200;

export function CategoryChips({ value, onChange }: { value?: Category; onChange: (c?: Category) => void }) {
  return (
    <div
      role="group"
      aria-label="Categories"
      className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1"
    >
      {CATEGORIES.map((c) => {
        const on = value === c.id;
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? undefined : c.id)}
            className={cn(
              'inline-flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-semibold',
              on ? 'border-transparent bg-grove text-on-grove' : 'border-line bg-surface hover:bg-sunk',
            )}
          >
            <NamedIcon name={c.icon} className="h-4 w-4" /> {c.label}
          </button>
        );
      })}
    </div>
  );
}

function toggle<T>(list: T[] | undefined, item: T, on: boolean): T[] {
  const l = list ?? [];
  return on ? [...l, item] : l.filter((x) => x !== item);
}

export function FilterDrawer({
  value,
  onChange,
  onClear,
  activeCount,
}: {
  value: ListingSearch;
  onChange: (next: ListingSearch) => void;
  onClear: () => void;
  activeCount: number;
}) {
  const min = Math.round((value.minCents ?? 0) / 100);
  const max = Math.round((value.maxCents ?? SLIDER_MAX_DOLLARS * 100) / 100);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">
          <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters
          {activeCount > 0 ? (
            <span
              className="tabular grid h-6 min-w-[24px] place-items-center rounded-full bg-grove px-1.5 text-xs text-on-grove"
              aria-label={`${activeCount} active`}
            >
              {activeCount}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        title={`Filters${activeCount ? ` (${activeCount})` : ''}`}
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={onClear}>
              Clear all
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 font-semibold">Price</legend>
            <Slider
              min={0}
              max={SLIDER_MAX_DOLLARS}
              step={1}
              value={[min, max]}
              thumbLabels={['Minimum price', 'Maximum price']}
              onValueChange={([a, b]) =>
                onChange({ ...value, minCents: (a ?? 0) * 100, maxCents: (b ?? SLIDER_MAX_DOLLARS) * 100 })
              }
            />
            <div className="flex items-end gap-3">
              <div className="flex flex-1 flex-col gap-1">
                <Label htmlFor="min-price">Min ($)</Label>
                <Input
                  id="min-price"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={min}
                  className="tabular"
                  onChange={(e) =>
                    onChange({ ...value, minCents: Math.max(0, Number(e.target.value) || 0) * 100 })
                  }
                />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <Label htmlFor="max-price">Max ($)</Label>
                <Input
                  id="max-price"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={max}
                  className="tabular"
                  onChange={(e) =>
                    onChange({ ...value, maxCents: Math.max(0, Number(e.target.value) || 0) * 100 })
                  }
                />
              </div>
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-1 font-semibold">Condition</legend>
            {CONDITIONS.map((c) => (
              <label key={c.id} className="flex min-h-[44px] cursor-pointer items-center gap-3">
                <Checkbox
                  checked={value.conditions?.includes(c.id) ?? false}
                  onCheckedChange={(on) =>
                    onChange({ ...value, conditions: toggle<Condition>(value.conditions, c.id, on === true) })
                  }
                />
                {c.label}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend className="mb-1 font-semibold">Housing Fit</legend>
            {HOUSING_FITS.map((h) => (
              <label key={h.id} className="flex min-h-[44px] cursor-pointer items-center gap-3">
                <Checkbox
                  checked={value.fits?.includes(h.id) ?? false}
                  onCheckedChange={(on) =>
                    onChange({ ...value, fits: toggle<HousingFit>(value.fits, h.id, on === true) })
                  }
                />
                {h.label}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend className="mb-2 font-semibold">Source</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Source">
              {([undefined, 'student', 'goods'] as (ListingSource | undefined)[]).map((s) => (
                <button
                  key={s ?? 'all'}
                  type="button"
                  role="radio"
                  aria-checked={value.source === s}
                  onClick={() => onChange({ ...value, source: s })}
                  className={cn(
                    'min-h-[44px] rounded-full border px-4 text-sm font-semibold',
                    value.source === s
                      ? 'border-transparent bg-grove text-on-grove'
                      : 'border-line hover:bg-sunk',
                  )}
                >
                  {s === undefined ? 'All' : s === 'student' ? 'Students' : 'Goods'}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="flex min-h-[44px] items-center justify-between gap-4">
            <Label htmlFor="free-only">Free only</Label>
            <Switch
              id="free-only"
              checked={value.freeOnly ?? false}
              onCheckedChange={(on) => onChange({ ...value, freeOnly: on })}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
