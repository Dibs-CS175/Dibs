'use client';

import { useEffect, useState } from 'react';
import { markStop } from '@/lib/actions/logistics';
import { useAction, useQuery } from '@/lib/hooks';
import { getRouteDays, getRouteStops } from '@/lib/queries/logistics';
import { ok } from '@/lib/result';
import type { RouteStopView, SlotKind } from '@/lib/types';

/** Data for a pickup or return route board: days, the chosen day's stops, and Done/Missed. */
export function useRouteBoard(kind: SlotKind) {
  const days = useQuery(() => getRouteDays(kind), [kind]);
  const [day, setDay] = useState<string | null>(null);
  useEffect(() => {
    if (days.state.status === 'data' && !day) setDay(days.state.data[0] ?? null);
  }, [days.state, day]);
  const stops = useQuery(
    () => (day ? getRouteStops(kind, day) : Promise.resolve(ok<RouteStopView[]>([]))),
    [kind, day],
  );
  const mark = useAction(markStop);
  const [busyId, setBusyId] = useState<string | null>(null);

  const markStopStatus = async (stopId: string, status: 'done' | 'missed') => {
    setBusyId(stopId);
    const r = await mark.run(stopId, status);
    setBusyId(null);
    if (r?.ok && stops.state.status === 'data') {
      stops.setData(stops.state.data.map((s) => (s.id === stopId ? { ...s, status: r.data.status } : s)));
    }
    return r;
  };

  return { days, day, setDay, stops, markStopStatus, busyId, markError: mark.error };
}
