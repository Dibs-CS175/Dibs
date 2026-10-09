'use client';

import { toast } from 'sonner';
import { RouteBoardView } from '@/components/admin/route-board-view';
import { PageHeader } from '@/components/layout/page-header';
import { useRouteBoard } from '@/lib/route-board';

export default function RoutesPage() {
  const b = useRouteBoard('pickup');
  return (
    <>
      <PageHeader
        title="Pickup routes"
        subtitle="Move-out week. Stops are grouped by building in route order."
      />
      <RouteBoardView
        days={b.days.state}
        onRetryDays={b.days.retry}
        day={b.day}
        onDay={b.setDay}
        stops={b.stops.state}
        onRetryStops={b.stops.retry}
        busyId={b.busyId}
        markError={b.markError?.message ?? null}
        emptyDaysText="No pickup days scheduled yet."
        onMark={async (id, status) => {
          const r = await b.markStopStatus(id, status);
          if (r?.ok) toast.success(status === 'done' ? 'Stop marked done' : 'Stop marked missed');
        }}
      />
    </>
  );
}
