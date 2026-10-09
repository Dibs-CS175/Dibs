import { Building2, Car, Home, School } from 'lucide-react';
import { HOUSING_TYPES } from '@/lib/config/app';
import type { HousingType } from '@/lib/types';
import { cn } from '@/lib/utils';

const ICON = { hall: School, campus_apartment: Building2, off_campus: Home, commuter: Car } as const;

export function HousingPicker({
  value,
  onChange,
}: {
  value: HousingType | null;
  onChange: (h: HousingType) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Housing type" className="grid grid-cols-2 gap-3">
      {HOUSING_TYPES.map((h) => {
        const Icon = ICON[h.id];
        const on = value === h.id;
        return (
          <button
            key={h.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(h.id)}
            className={cn(
              'flex min-h-[96px] flex-col items-start gap-3 rounded-card border-2 bg-surface p-4 text-left',
              on ? 'border-grove shadow-1' : 'border-line hover:border-muted',
            )}
          >
            <Icon className={cn('h-6 w-6', on ? 'text-success' : 'text-muted')} aria-hidden />
            <span className="font-semibold">{h.label}</span>
          </button>
        );
      })}
    </div>
  );
}
