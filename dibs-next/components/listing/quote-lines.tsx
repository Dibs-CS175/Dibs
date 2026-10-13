import { formatMoney } from '@/lib/format';
import type { Quote } from '@/lib/types';
import { cn } from '@/lib/utils';

/** Displays quote lines and the total exactly as returned. Adds nothing up. Announces changes. */
export function QuoteLines({ quote, totalLabel = 'All-in total' }: { quote: Quote; totalLabel?: string }) {
  return (
    <dl
      className="tabular flex flex-col gap-2 rounded-card bg-sunk p-4"
      aria-live="polite"
      aria-atomic="true"
    >
      {quote.lines.map((line, i) => (
        <div
          key={`${line.label}-${i}`}
          className={cn('flex justify-between gap-4', line.kind === 'credit' && 'text-success')}
        >
          <dt>{line.label}</dt>
          <dd>{formatMoney(line.cents)}</dd>
        </div>
      ))}
      <div className="flex justify-between gap-4 border-t border-line pt-2 text-lg font-bold">
        <dt>{totalLabel}</dt>
        <dd>{formatMoney(quote.totalCents)}</dd>
      </div>
    </dl>
  );
}
