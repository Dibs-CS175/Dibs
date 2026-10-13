// DEMO versions: fixture-backed stand-ins shown when the data source is Demo (the default).
// They are the working mockup, not production code. Write real code in lib/live/actions/summerHold.ts.

import { simulate } from '@/lib/dev';
import { bookingRecords, packingSlots } from '@/lib/fixtures/summerHold';
import { stubBooking } from '@/lib/demo/queries/summerHold';
import type { Result } from '@/lib/result';
import type { BookingDraftInput, MyBooking, ParentPayView, SummerHoldBooking } from '@/lib/types';

const mine = () => bookingRecords[0]!;

/**
 * Saves the choices as a draft booking and holds the packing appointment if Full Service is on.
 * Errors: VALIDATION, SLOT_FULL, DEADLINE_PASSED.
 */
export async function createBooking(input: BookingDraftInput): Promise<Result<SummerHoldBooking>> {
  return simulate(
    stubBooking({
      ...mine(),
      id: 'bk_new',
      status: 'draft',
      campusId: input.campusId,
      housingType: input.housingType || 'hall',
      address: input.address,
      standardCount: input.standardCount,
      largeCount: input.largeCount,
      fullService: input.fullService,
      packingSlotId: input.packingSlotId ?? undefined,
      addOnKeys: input.addOnKeys,
      referralCode: input.referralCode || undefined,
      registeredAt: undefined,
    }),
  );
}

/** Pays the registration; Dibs Protect holds it. Errors: PAYMENT_FAILED, DEADLINE_PASSED, REFERRAL_INVALID. */
export async function payRegistration(
  bookingId: string,
  referralCode: string,
): Promise<Result<SummerHoldBooking>> {
  return simulate(
    stubBooking({
      ...mine(),
      id: bookingId,
      status: 'registered',
      referralCode: referralCode || undefined,
      registeredAt: '2026-10-12T19:00:00Z',
    }),
  );
}

/** Creates a link a parent can open without signing in. */
export async function createParentPayLink(
  bookingId: string,
): Promise<Result<{ token: string; path: string }>> {
  void bookingId;
  return simulate({ token: 'demo-parent-7Hq2', path: '/pay/demo-parent-7Hq2' });
}

/** Errors: CONFLICT (already cancelled). */
export async function cancelBooking(bookingId: string): Promise<Result<MyBooking>> {
  return simulate<MyBooking>({
    booking: stubBooking({ ...mine(), id: bookingId, status: 'cancelled' }),
    packingSlot: null,
    canCancel: false,
    canPayBalance: false,
  });
}

/** Errors: PAYMENT_FAILED, DEADLINE_PASSED. */
export async function payBalance(bookingId: string): Promise<Result<MyBooking>> {
  return simulate<MyBooking>({
    booking: stubBooking({ ...mine(), id: bookingId, status: 'balance_paid' }),
    packingSlot: packingSlots.find((s) => s.id === mine().packingSlotId) ?? null,
    canCancel: true,
    canPayBalance: false,
  });
}

/** Public: a parent pays through their link. Errors: PAYMENT_FAILED, NOT_FOUND. */
export async function payAsParent(view: ParentPayView): Promise<Result<ParentPayView>> {
  return simulate({ ...view, paid: true });
}
