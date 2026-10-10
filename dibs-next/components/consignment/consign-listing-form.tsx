'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FormError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORIES, CONDITIONS, HOUSING_FITS } from '@/lib/config/app';
import { formatMoney } from '@/lib/format';
import type { ConsignedListingInput, StorageItem } from '@/lib/types';

/** Staff create the listing for a checked-in sell item. The price is the owner's asking price. */
export function ConsignListingForm({
  item,
  onSubmit,
  pending,
  error,
}: {
  item: StorageItem;
  onSubmit: (input: ConsignedListingInput) => void;
  pending: boolean;
  error: string | null;
}) {
  const [v, setV] = useState<ConsignedListingInput>({
    title: item.label,
    category: '',
    condition: '',
    housingFit: '',
    description: item.conditionNote ?? '',
  });
  const [touched, setTouched] = useState(false);
  const id = `cl-${item.id}`;
  const miss = (x: string) => touched && !x;
  return (
    <form
      noValidate
      className="flex flex-col gap-3 rounded-card bg-sunk p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (v.title.trim() && v.category && v.condition && v.housingFit) onSubmit(v);
      }}
    >
      <p className="font-semibold">
        Create listing{item.askingPriceCents !== undefined ? ` at ${formatMoney(item.askingPriceCents)}` : ''}
      </p>
      <Field id={`${id}-t`} label="Title" error={miss(v.title.trim()) ? 'Add a title.' : null}>
        <Input
          id={`${id}-t`}
          value={v.title}
          onChange={(e) => setV({ ...v, title: e.target.value })}
          aria-describedby={`${id}-t-msg`}
        />
      </Field>
      <div className="grid gap-3 md:grid-cols-3">
        <Field id={`${id}-c`} label="Category" error={miss(v.category) ? 'Pick one.' : null}>
          <NativeSelect
            id={`${id}-c`}
            value={v.category}
            onChange={(e) => setV({ ...v, category: e.target.value as ConsignedListingInput['category'] })}
          >
            <option value="">Choose…</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field id={`${id}-k`} label="Condition" error={miss(v.condition) ? 'Pick one.' : null}>
          <NativeSelect
            id={`${id}-k`}
            value={v.condition}
            onChange={(e) => setV({ ...v, condition: e.target.value as ConsignedListingInput['condition'] })}
          >
            <option value="">Choose…</option>
            {CONDITIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field id={`${id}-h`} label="Housing fit" error={miss(v.housingFit) ? 'Pick one.' : null}>
          <NativeSelect
            id={`${id}-h`}
            value={v.housingFit}
            onChange={(e) =>
              setV({ ...v, housingFit: e.target.value as ConsignedListingInput['housingFit'] })
            }
          >
            <option value="">Choose…</option>
            {HOUSING_FITS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
      </div>
      <Field id={`${id}-d`} label="Description" hint="Note any flaws from the condition photo.">
        <Textarea
          id={`${id}-d`}
          rows={2}
          value={v.description}
          onChange={(e) => setV({ ...v, description: e.target.value })}
          aria-describedby={`${id}-d-msg`}
        />
      </Field>
      <FormError message={error} />
      <Button type="submit" className="w-fit" disabled={pending}>
        {pending ? 'Publishing…' : 'Publish listing'}
      </Button>
    </form>
  );
}
