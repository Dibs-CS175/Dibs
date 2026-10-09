import { simulate } from '@/lib/dev';
import { routeStops } from '@/lib/fixtures/logistics';
import type { Result } from '@/lib/result';
import type { RouteStop, StorageItem } from '@/lib/types';

export async function markStop(stopId: string, status: 'done' | 'missed'): Promise<Result<RouteStop>> {
  // STUB(logistics): replace with real implementation
  const s = routeStops.find((x) => x.id === stopId) ?? routeStops[0]!;
  return simulate<RouteStop>({ ...s, status });
}

export interface CheckInInput {
  conditionPhoto?: string;
  conditionNote: string;
  binId: string;
}

/** Errors: CAPACITY_FULL when the bin filled up. */
export async function checkInItem(item: StorageItem, input: CheckInInput): Promise<Result<StorageItem>> {
  // STUB(logistics): replace with real implementation
  return simulate<StorageItem>({ ...item, status: 'checked_in', ...input });
}

export async function refuseItem(item: StorageItem, reason: string): Promise<Result<StorageItem>> {
  // STUB(logistics): replace with real implementation
  return simulate<StorageItem>({ ...item, status: 'refused', conditionNote: reason });
}

export async function markItemDamaged(item: StorageItem, note: string): Promise<Result<StorageItem>> {
  // STUB(logistics): replace with real implementation
  return simulate<StorageItem>({ ...item, status: 'damaged', conditionNote: note });
}
