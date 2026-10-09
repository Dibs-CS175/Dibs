import { simulate } from '@/lib/dev';
import { bins, pickupDays, returnDays, routeStops } from '@/lib/fixtures/logistics';
import { pickupSlots, returnSlots } from '@/lib/fixtures/summerHold';
import type { Result } from '@/lib/result';
import type { BinView, RouteStopView, SlotKind, SlotView, StopDetail } from '@/lib/types';

/** Days that have pickup or return routes, as YYYY-MM-DD in the display time zone. */
export async function getRouteDays(kind: SlotKind): Promise<Result<string[]>> {
  // STUB(logistics): replace with real implementation
  return simulate(kind === 'pickup' ? pickupDays : returnDays, []);
}

/** Stops for one day, in route order. The backend groups and orders them. */
export async function getRouteStops(kind: SlotKind, day: string): Promise<Result<RouteStopView[]>> {
  // STUB(logistics): replace with real implementation
  const slots = (kind === 'pickup' ? pickupSlots : returnSlots)
    .filter((s) => s.startsAt.startsWith(day))
    .map((s) => s.id);
  return simulate(
    routeStops.filter((st) => slots.includes(st.slotId)),
    [],
  );
}

export async function getStop(stopId: string): Promise<Result<StopDetail>> {
  // STUB(logistics): replace with real implementation
  return simulate<StopDetail>({ stop: routeStops.find((s) => s.id === stopId) ?? routeStops[3]!, bins });
}

export async function getBins(): Promise<Result<BinView[]>> {
  // STUB(logistics): replace with real implementation
  return simulate(bins, []);
}

export async function getSlots(kind: SlotKind): Promise<Result<SlotView[]>> {
  // STUB(logistics): replace with real implementation
  return simulate(kind === 'pickup' ? pickupSlots : returnSlots, []);
}
