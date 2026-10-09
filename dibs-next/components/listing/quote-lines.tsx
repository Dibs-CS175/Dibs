import { formatMoney } from '@/lib/format';
import type { Quote } from '@/lib/types';

/** Displays quote lines and the total exactly as returned. Adds nothing up. */
export function QuoteLines({ quote }: { quote: Quote }) {
  return (
    <dl className="tabular flex flex-col gap-2 rounded-card bg-sunk p-4" aria-live="polite">
      {quote.lines.map((line, i) => (
        <div key={`${line.label}-${i}`} className="flex justify-between gap-4">
          <dt>{line.label}</dt>
          <dd>{formatMoney(line.cents)}</dd>
        </div>
      ))}
      <div className="flex justify-between gap-4 border-t border-line pt-2 text-lg font-bold">
        <dt>Total</dt>
        <dd>{formatMoney(quote.totalCents)}</dd>
      </div>
    </dl>
  );
}
