import { CalendarX, Truck } from 'lucide-react';
import { DayPicker } from './day-picker';
import { StopCard } from './stop-card';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/states';
import { Skeleton } from '@/components/ui/skeleton';
import { FormError } from '@/components/ui/field';
import type { QueryState } from '@/lib/hooks';
import type { RouteStopView } from '@/lib/types';

/** Day picker plus stops grouped by building. The backend returns stops in route order. */
export function RouteBoardView({
  days,
  onRetryDays,
  day,
  onDay,
  stops,
  onRetryStops,
  onMark,
  busyId,
  markError,
  emptyDaysText,
}: {
  days: QueryState<string[]>;
  onRetryDays: () => void;
  day: string | null;
  onDay: (d: string) => void;
  stops: QueryState<RouteStopView[]>;
  onRetryStops: () => void;
  onMark: (stopId: string, status: 'done' | 'missed') => void;
  busyId: string | null;
  markError: string | null;
  emptyDaysText: string;
}) {
  if (days.status === 'loading') return <Skeleton className="h-14 w-full rounded-input" />;
  if (days.status === 'error') return <ErrorState message={days.error.message} onRetry={onRetryDays} />;
  if (days.data.length === 0)
    return (
      <EmptyState icon={CalendarX} text={emptyDaysText} actionLabel="Check again" onAction={onRetryDays} />
    );

  const buildings = stops.status === 'data' ? Array.from(new Set(stops.data.map((s) => s.building))) : [];
  return (
    <div className="flex flex-col gap-5">
      <DayPicker days={days.data} value={day} onChange={onDay} />
      <FormError message={markError} />
      {stops.status === 'loading' ? (
        <ListSkeleton rows={4} />
      ) : stops.status === 'error' ? (
        <ErrorState message={stops.error.message} onRetry={onRetryStops} />
      ) : stops.data.length === 0 ? (
        <EmptyState icon={Truck} text="No stops on this day." actionLabel="Reload" onAction={onRetryStops} />
      ) : (
        buildings.map((b) => (
          <section key={b} aria-labelledby={`b-${b}`} className="flex flex-col gap-3">
            <h2 id={`b-${b}`} className="text-xl font-bold">
              {b}
            </h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {stops.data
                .filter((s) => s.building === b)
                .map((s) => (
                  <li key={s.id}>
                    <StopCard stop={s} pending={busyId === s.id} onMark={(st) => onMark(s.id, st)} />
                  </li>
                ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
