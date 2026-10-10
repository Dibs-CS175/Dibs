'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FormError } from '@/components/ui/field';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import type { DamageCause } from '@/lib/types';
import { cn } from '@/lib/utils';

/** Plain-language outcome for each cause. The backend applies the outcome; this only explains it. */
const CAUSES: { id: DamageCause; label: string; outcome: string }[] = [
  {
    id: 'storage_facility',
    label: 'No one at Dibs or a buyer',
    outcome: 'Dibs files a claim with the storage facility.',
  },
  { id: 'dibs', label: 'Dibs staff', outcome: 'The owner is paid as if it sold at their asking price.' },
  {
    id: 'buyer',
    label: 'The buyer, while collecting',
    outcome: 'The sale completes and the buyer keeps the item.',
  },
];

export function DamageSheet({
  open,
  onOpenChange,
  itemLabel,
  onSubmit,
  pending,
  error,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  itemLabel: string;
  onSubmit: (cause: DamageCause, note: string) => void;
  pending: boolean;
  error: string | null;
}) {
  const [cause, setCause] = useState<DamageCause | null>(null);
  const [note, setNote] = useState('');
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        title="Record damage"
        description={itemLabel}
        footer={
          <Button
            variant="destructive"
            className="w-full"
            disabled={!cause || !note.trim() || pending}
            onClick={() => cause && onSubmit(cause, note)}
          >
            {pending ? 'Saving…' : 'Record damage'}
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 font-semibold">Who caused it?</legend>
            {CAUSES.map((c) => (
              <label
                key={c.id}
                className={cn(
                  'flex min-h-[48px] cursor-pointer items-start gap-3 rounded-input border p-3',
                  cause === c.id ? 'border-grove bg-success-bg' : 'border-line',
                )}
              >
                <input
                  type="radio"
                  name="cause"
                  className="mt-1 h-5 w-5 accent-[var(--grove)]"
                  checked={cause === c.id}
                  onChange={() => setCause(c.id)}
                />
                <span className="flex flex-col">
                  <span className="font-semibold">{c.label}</span>
                  <span className="text-sm text-muted">{c.outcome}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <Field
            id="damage-note"
            label="What happened"
            hint="Required. Add photos at check-in if you have them."
          >
            <Textarea
              id="damage-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              aria-describedby="damage-note-msg"
            />
          </Field>
          <FormError message={error} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
