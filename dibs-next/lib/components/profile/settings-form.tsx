'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FormError } from '@/components/ui/field';
import { NativeSelect } from '@/components/ui/native-select';
import { HOUSING_TYPES } from '@/lib/config/app';
import type { HousingType, Settings } from '@/lib/types';
import { cn } from '@/lib/utils';

export function SettingsForm({
  initial,
  onSave,
  pending,
  error,
}: {
  initial: Settings;
  onSave: (s: Settings) => void;
  pending: boolean;
  error: string | null;
}) {
  const [s, setS] = useState<Settings>(initial);
  return (
    <form
      className="flex max-w-[560px] flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(s);
      }}
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold">How you call dibs</legend>
        {(
          [
            {
              id: 'hold',
              label: 'Press and hold',
              hint: 'Hold the button for a moment. Prevents accidental taps.',
            },
            {
              id: 'tap',
              label: 'Tap, then confirm',
              hint: 'Tap once, then confirm. Easier with switch access or a screen reader.',
            },
          ] as const
        ).map((g) => (
          <label
            key={g.id}
            className={cn(
              'flex min-h-[48px] cursor-pointer items-start gap-3 rounded-input border p-3',
              s.dibsGesture === g.id ? 'border-grove bg-success-bg' : 'border-line bg-surface',
            )}
          >
            <input
              type="radio"
              name="gesture"
              className="mt-1 h-5 w-5 accent-[var(--grove)]"
              checked={s.dibsGesture === g.id}
              onChange={() => setS({ ...s, dibsGesture: g.id })}
            />
            <span className="flex flex-col">
              <span className="font-semibold">{g.label}</span>
              <span className="text-sm text-muted">{g.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <Field id="housing" label="Housing" hint="Used to suggest items that fit where you live.">
        <NativeSelect
          id="housing"
          value={s.housingType ?? ''}
          onChange={(e) => setS({ ...s, housingType: (e.target.value || null) as HousingType | null })}
          aria-describedby="housing-msg"
        >
          <option value="">Prefer not to say</option>
          {HOUSING_TYPES.map((h) => (
            <option key={h.id} value={h.id}>
              {h.label}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <FormError message={error} />
      <Button type="submit" className="w-fit" disabled={pending}>
        {pending ? 'Saving…' : 'Save settings'}
      </Button>
    </form>
  );
}
