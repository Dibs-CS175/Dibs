'use client';

import { Check, Circle, Dot } from 'lucide-react';
import { formatDateTime } from '@/lib/format';
import type { TimelineStep } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useTimeZone } from '@/lib/campus';

/** Renders the timeline exactly as the backend returns it. */
export function Timeline({ steps }: { steps: TimelineStep[] }) {
  const tz = useTimeZone();
  return (
    <ol className="flex flex-col">
      {steps.map((s, i) => (
        <li
          key={`${s.label}-${i}`}
          className="relative flex gap-3 pb-5 last:pb-0"
          aria-current={s.state === 'current' ? 'step' : undefined}
        >
          {i < steps.length - 1 ? (
            <span className="absolute left-[11px] top-6 h-[calc(100%-24px)] w-0.5 bg-line" aria-hidden />
          ) : null}
          <span
            className={cn(
              'grid h-6 w-6 shrink-0 place-items-center rounded-full',
              s.state === 'done' && 'bg-success text-white',
              s.state === 'current' && 'bg-navel text-on-accent',
              s.state === 'upcoming' && 'border-2 border-line bg-surface text-muted',
            )}
          >
            {s.state === 'done' ? (
              <Check className="h-3.5 w-3.5" aria-hidden />
            ) : s.state === 'current' ? (
              <Dot className="h-5 w-5" aria-hidden />
            ) : (
              <Circle className="h-2 w-2" aria-hidden />
            )}
          </span>
          <div className="flex flex-col">
            <span className={cn('font-semibold', s.state === 'upcoming' && 'text-muted')}>{s.label}</span>
            <span className="text-sm text-muted">
              {s.at
                ? formatDateTime(s.at, tz)
                : s.state === 'current'
                  ? 'Now'
                  : s.state === 'done'
                    ? 'Done'
                    : 'Next'}
              <span className="sr-only"> ({s.state})</span>
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
