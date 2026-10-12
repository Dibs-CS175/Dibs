'use client';

import { formatDate, formatTime } from '@/lib/format';
import type { SlotView } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useTimeZone } from '@/lib/campus';

/** Slots grouped by day. Full slots (decided by the backend) are disabled and labeled. */
export function SlotPicker({
  slots,
  value,
  onChange,
  name,
}: {
  slots: SlotView[];
  value: string | null;
  onChange: (id: string) => void;
  name: string;
}) {
  const tz = useTimeZone();
  const days = Array.from(
    new Set(
      slots.map((s) => formatDate(s.startsAt, tz, { weekday: 'long', month: 'short', day: 'numeric' })),
    ),
  );
  return (
    <div className="flex flex-col gap-4">
      {days.map((day) => (
        <fieldset key={day} className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-semibold">{day}</legend>
          <div className="grid grid-cols-2 gap-2">
            {slots
              .filter(
                (s) =>
                  formatDate(s.startsAt, tz, { weekday: 'long', month: 'short', day: 'numeric' }) === day,
              )
              .map((s) => (
                <label
                  key={s.id}
                  className={cn(
                    'flex min-h-[56px] cursor-pointer flex-col justify-center rounded-input border px-3 py-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-navel',
                    s.isFull && 'cursor-not-allowed bg-sunk text-muted',
                    value === s.id ? 'border-grove bg-success-bg' : 'border-line bg-surface',
                  )}
                >
                  <input
                    type="radio"
                    name={name}
                    className="sr-only"
                    disabled={s.isFull}
                    checked={value === s.id}
                    onChange={() => onChange(s.id)}
                  />
                  <span className="tabular font-semibold">
                    {formatTime(s.startsAt, tz)} to {formatTime(s.endsAt, tz)}
                  </span>
                  <span className="text-xs">{s.isFull ? 'Full' : `${s.booked} of ${s.capacity} booked`}</span>
                </label>
              ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

/** Read-only availability list, for the public explainer. */
export function SlotAvailability({ slots }: { slots: SlotView[] }) {
  const tz = useTimeZone();
  const days = Array.from(
    new Set(
      slots.map((s) => formatDate(s.startsAt, tz, { weekday: 'long', month: 'short', day: 'numeric' })),
    ),
  );
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {days.map((day) => (
        <div key={day} className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4">
          <h3 className="font-sans text-sm font-semibold">{day}</h3>
          <ul className="flex flex-col gap-1">
            {slots
              .filter(
                (s) =>
                  formatDate(s.startsAt, tz, { weekday: 'long', month: 'short', day: 'numeric' }) === day,
              )
              .map((s) => (
                <li key={s.id} className="tabular flex justify-between gap-2 text-sm">
                  <span>
                    {formatTime(s.startsAt, tz)} to {formatTime(s.endsAt, tz)}
                  </span>
                  <span className={s.isFull ? 'text-muted' : 'font-semibold text-success'}>
                    {s.isFull ? 'Full' : 'Open'}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
