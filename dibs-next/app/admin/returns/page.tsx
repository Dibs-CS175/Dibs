'use client';

import { CalendarX } from 'lucide-react';
import { toast } from 'sonner';
import { RouteBoardView } from '@/components/admin/route-board-view';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState, ErrorState } from '@/components/states';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { formatWindow } from '@/lib/format';
import { useQuery } from '@/lib/hooks';
import { getSlots } from '@/lib/queries/logistics';
import { useRouteBoard } from '@/lib/route-board';

export default function ReturnsPage() {
  const slots = useQuery(() => getSlots('return'), []);
  const b = useRouteBoard('return');
  return (
    <>
      <PageHeader title="Returns" subtitle="Fall return windows and the return route." />
      <section aria-labelledby="slots-h" className="flex flex-col gap-3">
        <h2 id="slots-h" className="text-xl font-bold">
          Return windows
        </h2>
        {slots.state.status === 'loading' ? (
          <Skeleton className="h-40 rounded-card" />
        ) : slots.state.status === 'error' ? (
          <ErrorState message={slots.state.error.message} onRetry={slots.retry} />
        ) : slots.state.data.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            text="No return windows yet."
            actionLabel="Reload"
            onAction={slots.retry}
          />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {slots.state.data.map((s) => (
              <li key={s.id} className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{formatWindow(s.startsAt, s.endsAt)}</span>
                  {s.isFull ? <Badge variant="error">Full</Badge> : null}
                </div>
                <Progress
                  value={s.booked}
                  max={s.capacity}
                  label={`${formatWindow(s.startsAt, s.endsAt)} bookings`}
                />
                <span className="tabular text-sm text-muted">
                  {s.booked} of {s.capacity} booked
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="route-h" className="flex flex-col gap-3">
        <h2 id="route-h" className="text-xl font-bold">
          Return route
        </h2>
        <RouteBoardView
          days={b.days.state}
          onRetryDays={b.days.retry}
          day={b.day}
          onDay={b.setDay}
          stops={b.stops.state}
          onRetryStops={b.stops.retry}
          busyId={b.busyId}
          markError={b.markError?.message ?? null}
          emptyDaysText="No return days scheduled yet."
          onMark={async (id, status) => {
            const r = await b.markStopStatus(id, status);
            if (r?.ok) toast.success(status === 'done' ? 'Delivered' : 'Marked missed');
          }}
        />
      </section>
    </>
  );
}
