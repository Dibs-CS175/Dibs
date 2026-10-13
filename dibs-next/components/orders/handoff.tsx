'use client';

import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/** Buyer view: the code the backend issued. Shown large so the seller can read it at the meetup. */
export function HandoffCodeDisplay({ code, note }: { code: string; note?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card bg-grove p-6 text-on-grove">
      <span className="flex items-center gap-2 text-sm font-semibold">
        <KeyRound className="h-4 w-4" aria-hidden /> Your handoff code
      </span>
      <span
        className="tabular font-display text-6xl font-extrabold tracking-[0.2em]"
        aria-label={`Handoff code ${code.split('').join(' ')}`}
      >
        {code}
      </span>
      <p className="max-w-xs text-center text-sm text-white/85">
        {note ?? 'Share this only after you have the item in hand. It releases payment to the seller.'}
      </p>
    </div>
  );
}

/**
 * Seller view: enter the buyer's 4-digit code. The backend checks it and returns attemptsRemaining;
 * `locked` comes back as ATTEMPTS_EXCEEDED.
 */
export function HandoffCodeEntry({
  onSubmit,
  pending,
  error,
  attemptsRemaining,
  locked = false,
}: {
  onSubmit: (code: string) => void;
  pending: boolean;
  error: string | null;
  attemptsRemaining?: number;
  locked?: boolean;
}) {
  const [code, setCode] = useState('');
  const complete = /^\d{4}$/.test(code);
  return (
    <form
      className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (complete && !locked) onSubmit(code);
      }}
    >
      <Label htmlFor="handoff">Enter the buyer’s handoff code</Label>
      <div className="flex gap-2">
        <Input
          id="handoff"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={4}
          value={code}
          disabled={locked}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
          aria-invalid={Boolean(error)}
          aria-describedby="handoff-msg"
          className="tabular max-w-[160px] text-center text-2xl font-semibold tracking-[0.3em]"
        />
        <Button type="submit" disabled={!complete || pending || locked}>
          {pending ? 'Checking…' : 'Confirm handoff'}
        </Button>
      </div>
      <p
        id="handoff-msg"
        role={error ? 'alert' : undefined}
        className={error ? 'text-sm text-error' : 'text-sm text-muted'}
      >
        {error
          ? `${error}${attemptsRemaining !== undefined && !locked ? ` ${attemptsRemaining} ${attemptsRemaining === 1 ? 'attempt' : 'attempts'} left.` : ''}`
          : `Ask the buyer for their 4-digit code once they have the item.${
              attemptsRemaining !== undefined
                ? ` ${attemptsRemaining} ${attemptsRemaining === 1 ? 'attempt' : 'attempts'} left.`
                : ''
            }`}
      </p>
    </form>
  );
}
