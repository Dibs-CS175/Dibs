'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/queries/summerHold.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { notImplemented } from '@/lib/live/not-implemented';
import type { Result } from '@/lib/result';
import type { MyBooking, ParentPayView, SlotView } from '@/lib/types';

/** The signed-in student's booking for this summer, or null. Flags come from the backend. */
export async function getMyBooking(): Promise<Result<MyBooking | null>> {
  // STUB(summerHold): replace with real implementation
  return notImplemented('getMyBooking', 'lib/live/queries/summerHold.ts');
}

/** Full Service packing appointments for a campus. `isFull` comes from the backend. */
export async function getPackingSlots(campusId: string): Promise<Result<SlotView[]>> {
  // STUB(summerHold): replace with real implementation
  return notImplemented('getPackingSlots', 'lib/live/queries/summerHold.ts');
}

/** Move-out pickup windows for a campus. */
export async function getPickupSlots(campusId: string): Promise<Result<SlotView[]>> {
  // STUB(summerHold): replace with real implementation
  return notImplemented('getPickupSlots', 'lib/live/queries/summerHold.ts');
}

/** Public: what a parent sees on the pay link. No sign-in. Errors: NOT_FOUND for an unknown token. */
export async function getParentPayView(token: string): Promise<Result<ParentPayView>> {
  // STUB(summerHold): replace with real implementation
  return notImplemented('getParentPayView', 'lib/live/queries/summerHold.ts');
}
