'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { formatMoney } from '@/lib/format';
import type { ItemDisposition, ItemSize, StorageItemInput } from '@/lib/types';
import { cn } from '@/lib/utils';

const PRICE_RE = /^\d+(\.\d{1,2})?$/;
const toText = (cents: number | null) => (cents === null ? '' : String(cents / 100));

export const blankItem = (): StorageItemInput => ({
  label: '',
  size: 'standard',
  disposition: 'return',
  askingPriceCents: null,
});

/** Client check only: every item is named, and every sell item has a price in a valid format. */
export const itemsComplete = (items: StorageItemInput[]) =>
  items.length > 0 &&
  items.every((i) => i.label.trim() !== '' && (i.disposition === 'return' || i.askingPriceCents !== null));

/**
 * Add, name and size items, and choose for each one whether it comes back in fall or Dibs sells it.
 * The minimum price is shown as a hint; the backend enforces it.
 */
export function ItemsEditor({
  items,
  onChange,
  showErrors,
  minPriceCents,
}: {
  items: StorageItemInput[];
  onChange: (i: StorageItemInput[]) => void;
  showErrors?: boolean;
  minPriceCents?: number;
}) {
  const [texts, setTexts] = useState<string[]>(() => items.map((i) => toText(i.askingPriceCents)));
  const update = (i: number, patch: Partial<StorageItemInput>) =>
    onChange(items.map((it, n) => (n === i ? { ...it, ...patch } : it)));
  const setPrice = (i: number, text: string) => {
    setTexts((t) => t.map((x, n) => (n === i ? text : x)));
    update(i, { askingPriceCents: PRICE_RE.test(text) ? Math.round(Number(text) * 100) : null });
  };

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {items.map((it, i) => {
          const missing = showErrors && !it.label.trim();
          const text = texts[i] ?? '';
          const badPrice = it.disposition === 'sell' && text !== '' && !PRICE_RE.test(text);
          const noPrice = showErrors && it.disposition === 'sell' && text === '';
          return (
            <li key={i} className="flex flex-col gap-2 rounded-card border border-line bg-surface p-3">
              <div className="flex items-center gap-2">
                <label htmlFor={`item-${i}`} className="sr-only">
                  Item {i + 1} name
                </label>
                <Input
                  id={`item-${i}`}
                  value={it.label}
                  placeholder="e.g. Box of books"
                  onChange={(e) => update(i, { label: e.target.value })}
                  aria-invalid={missing}
                  className="min-w-0 flex-1"
                />
                <label htmlFor={`size-${i}`} className="sr-only">
                  Item {i + 1} size
                </label>
                <NativeSelect
                  id={`size-${i}`}
                  value={it.size}
                  onChange={(e) => update(i, { size: e.target.value as ItemSize })}
                  className="w-[112px]"
                >
                  <option value="standard">Standard</option>
                  <option value="large">Large</option>
                </NativeSelect>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove item ${i + 1}`}
                  disabled={items.length === 1}
                  onClick={() => {
                    onChange(items.filter((_, n) => n !== i));
                    setTexts((t) => t.filter((_, n) => n !== i));
                  }}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </div>
              {missing ? (
                <p role="alert" className="text-sm text-error">
                  Name this item.
                </p>
              ) : null}
              <fieldset className="flex flex-wrap items-center gap-2">
                <legend className="sr-only">After summer, item {i + 1} should</legend>
                {(
                  [
                    { id: 'return', label: 'Return in fall' },
                    { id: 'sell', label: 'Sell it for me' },
                  ] as { id: ItemDisposition; label: string }[]
                ).map((d) => (
                  <label
                    key={d.id}
                    className={cn(
                      'inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-navel',
                      it.disposition === d.id
                        ? 'border-grove bg-grove text-on-grove'
                        : 'border-line bg-surface',
                    )}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      name={`disp-${i}`}
                      checked={it.disposition === d.id}
                      onChange={() =>
                        update(i, {
                          disposition: d.id,
                          askingPriceCents:
                            d.id === 'return'
                              ? null
                              : PRICE_RE.test(text)
                                ? Math.round(Number(text) * 100)
                                : null,
                        })
                      }
                    />
                    {d.label}
                  </label>
                ))}
              </fieldset>
              {it.disposition === 'sell' ? (
                <div className="flex flex-col gap-1">
                  <label htmlFor={`price-${i}`} className="text-sm font-semibold">
                    Asking price ($)
                  </label>
                  <Input
                    id={`price-${i}`}
                    inputMode="decimal"
                    value={text}
                    onChange={(e) => setPrice(i, e.target.value)}
                    aria-invalid={badPrice || noPrice}
                    aria-describedby={`price-${i}-msg`}
                    className="tabular max-w-[160px]"
                  />
                  <p
                    id={`price-${i}-msg`}
                    role={badPrice || noPrice ? 'alert' : undefined}
                    className={cn('text-sm', badPrice || noPrice ? 'text-error' : 'text-muted')}
                  >
                    {badPrice
                      ? 'Enter an amount like 45 or 45.50.'
                      : noPrice
                        ? 'Add an asking price.'
                        : minPriceCents !== undefined
                          ? `Minimum ${formatMoney(minPriceCents)}.`
                          : 'Dibs lists it once it is checked in.'}
                  </p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      <Button
        variant="secondary"
        className="w-fit"
        onClick={() => {
          onChange([...items, blankItem()]);
          setTexts((t) => [...t, '']);
        }}
      >
        <Plus className="h-4 w-4" aria-hidden /> Add item
      </Button>
      <p className="text-sm text-muted">
        Standard: fits in a box or bin. Large: furniture, bikes, mini-fridges.
      </p>
    </div>
  );
}
