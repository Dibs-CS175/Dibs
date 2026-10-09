import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

/** Days are YYYY-MM-DD strings from the backend. Noon UTC keeps the label on the same calendar day in Pacific time. */
export function DayPicker({
  days,
  value,
  onChange,
}: {
  days: string[];
  value: string | null;
  onChange: (d: string) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Day"
      className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
    >
      {days.map((d) => {
        const on = d === value;
        return (
          <button
            key={d}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(d)}
            className={cn(
              'flex min-h-[56px] shrink-0 flex-col items-center justify-center rounded-input border px-4',
              on ? 'border-grove bg-grove text-on-grove' : 'border-line bg-surface',
            )}
          >
            <span className="text-xs">{formatDate(`${d}T19:00:00Z`, { weekday: 'short' })}</span>
            <span className="font-semibold">{formatDate(`${d}T19:00:00Z`)}</span>
          </button>
        );
      })}
    </div>
  );
}
