import { simulate } from '@/lib/dev';
import { myBookingFixture, pickupSlots, returnSlots } from '@/lib/fixtures/summerHold';
import type { Result } from '@/lib/result';
import type { MyBooking, SlotView } from '@/lib/types';

/** The signed-in student's booking, or null when they have none. */
export async function getMyBooking(): Promise<Result<MyBooking | null>> {
  // STUB(summerHold): replace with real implementation
  return simulate<MyBooking | null>(myBookingFixture, null);
}

/** Pickup slots for move-out week. `isFull` is decided by the backend. */
export async function getPickupSlots(): Promise<Result<SlotView[]>> {
  // STUB(summerHold): replace with real implementation
  return simulate(pickupSlots, []);
}

export async function getReturnSlots(): Promise<Result<SlotView[]>> {
  // STUB(summerHold): replace with real implementation
  return simulate(returnSlots, []);
}
