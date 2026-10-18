'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { QuoteLines } from './quote-lines';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/states';
import { errorMessage } from '@/lib/errorMessages';
import type { QueryState } from '@/lib/hooks';
import type { Quote } from '@/lib/types';
import { cn } from '@/lib/utils';

export function CheckoutSheet({
  open,
  onOpenChange,
  title,
  quote,
  onRetryQuote,
  onConfirm,
  pending,
  error,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  quote: QueryState<Quote>;
  onRetryQuote: () => void;
  onConfirm: () => void;
  pending: boolean;
  error: string | null;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        title="Confirm your Dibs"
        description={title}
        footer={
          <Button
            size="lg"
            variant="dibs"
            className="w-full"
            disabled={pending || quote.status !== 'data'}
            onClick={onConfirm}
          >
            {pending ? 'Holding payment…' : 'Pay with Dibs Protect'}
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          {quote.status === 'loading' ? (
            <Skeleton className="h-32 w-full rounded-card" />
          ) : quote.status === 'error' ? (
            <ErrorState message={errorMessage(quote.error)} onRetry={onRetryQuote} />
          ) : (
            <QuoteLines quote={quote.data} />
          )}
          <p className="flex items-start gap-2 text-sm text-muted">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden /> Dibs Protect holds
            your payment until you hand the seller your code.
          </p>
          {error ? (
            <p role="alert" className="rounded-input bg-error-bg px-3 py-2 text-sm text-error">
              {error}
            </p>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function OfferSheet({
  open,
  onOpenChange,
  onSubmit,
  pending,
  error,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (cents: number) => void;
  pending: boolean;
  error: string | null;
}) {
  const [dollars, setDollars] = useState('');
  const invalid = dollars !== '' && !/^\d+(\.\d{1,2})?$/.test(dollars);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        title="Make an offer"
        footer={
          <Button
            className="w-full"
            disabled={pending || !dollars || invalid}
            onClick={() => onSubmit(Math.round(Number(dollars) * 100))}
          >
            {pending ? 'Sending…' : 'Send offer'}
          </Button>
        }
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="offer">Your offer ($)</Label>
          <Input
            id="offer"
            inputMode="decimal"
            value={dollars}
            onChange={(e) => setDollars(e.target.value)}
            aria-invalid={invalid || Boolean(error)}
            aria-describedby="offer-msg"
            className="tabular max-w-[200px] text-2xl font-semibold"
          />
          <p
            id="offer-msg"
            className={cn('text-sm', invalid || error ? 'text-error' : 'text-muted')}
            role={error ? 'alert' : undefined}
          >
            {invalid
              ? 'Enter an amount like 25 or 25.50.'
              : (error ?? 'The seller can accept, decline or reply in messages.')}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
