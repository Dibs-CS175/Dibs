import { currentCampusId, simulate } from '@/lib/dev';
import { campuses } from '@/lib/fixtures/campuses';
import { bookingRecords, packingSlots, pickupSlots, type BookingRecord } from '@/lib/fixtures/summerHold';
import { findUser, me } from '@/lib/fixtures/users';
import { stubBookingDates, stubSummerHoldQuote } from '@/lib/queries/pricing';
import { fail, type Result } from '@/lib/result';
import type { MyBooking, ParentPayView, SlotView, SummerHoldBooking } from '@/lib/types';

/** Stub helper: a booking record with its quote and dates from the pricing stub helpers. */
export function stubBooking(rec: BookingRecord): SummerHoldBooking {
  return {
    ...rec,
    ...stubBookingDates(rec.campusId),
    quote: stubSummerHoldQuote({
      ...rec,
      referralCode: rec.referralCode ?? '',
      tierKey: rec.registrationTierKey,
    }),
  };
}

/** The signed-in student's booking for this summer, or null. Flags come from the backend. */
export async function getMyBooking(): Promise<Result<MyBooking | null>> {
  // STUB(summerHold): replace with real implementation
  const rec = bookingRecords.find((b) => b.userId === me.id)!;
  const booking = stubBooking({ ...rec, campusId: currentCampusId() });
  return simulate<MyBooking | null>(
    {
      booking,
      packingSlot: packingSlots.find((s) => s.id === rec.packingSlotId) ?? null,
      canCancel: true,
      canPayBalance: true,
    },
    null,
  );
}

/** Full Service packing appointments for a campus. `isFull` comes from the backend. */
export async function getPackingSlots(campusId: string): Promise<Result<SlotView[]>> {
  // STUB(summerHold): replace with real implementation
  return simulate(
    packingSlots.filter((s) => s.campusId === campusId),
    [],
  );
}

/** Move-out pickup windows for a campus. */
export async function getPickupSlots(campusId: string): Promise<Result<SlotView[]>> {
  // STUB(summerHold): replace with real implementation
  return simulate(
    pickupSlots.filter((s) => s.campusId === campusId),
    [],
  );
}

/** Public: what a parent sees on the pay link. No sign-in. Errors: NOT_FOUND for an unknown token. */
export async function getParentPayView(token: string): Promise<Result<ParentPayView>> {
  // STUB(summerHold): replace with real implementation
  const rec = bookingRecords.find((b) => b.parentPayToken === token);
  if (!rec) {
    await simulate(null);
    return fail('NOT_FOUND', 'This pay link is not valid.');
  }
  const b = stubBooking(rec);
  return simulate<ParentPayView>({
    token,
    studentFirstName: findUser(b.userId).firstName,
    campusName: campuses.find((c) => c.id === b.campusId)!.name,
    standardCount: b.standardCount,
    largeCount: b.largeCount,
    fullService: b.fullService,
    quote: b.quote,
    paid: false,
  });
}
