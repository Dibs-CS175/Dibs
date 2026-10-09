import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Step indicator for multi-step flows. Presentational: the page owns the current step. */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol
      className="flex items-center gap-2"
      aria-label={`Step ${current + 1} of ${steps.length}: ${steps[current] ?? ''}`}
    >
      {steps.map((s, i) => (
        <li
          key={s}
          className="flex min-w-0 flex-1 flex-col gap-1"
          aria-current={i === current ? 'step' : undefined}
        >
          <span className={cn('h-1.5 rounded-full', i <= current ? 'bg-navel' : 'bg-line')} aria-hidden />
          <span
            className={cn(
              'flex items-center gap-1 truncate text-xs',
              i === current ? 'font-semibold text-ink' : 'text-muted',
            )}
          >
            {i < current ? <Check className="h-3 w-3 shrink-0" aria-hidden /> : null}
            <span className="truncate">{s}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
