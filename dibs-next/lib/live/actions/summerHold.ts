'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/actions/summerHold.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { notImplemented } from '@/lib/live/not-implemented';
import type { Result } from '@/lib/result';
import type { BookingDraftInput, MyBooking, ParentPayView, SummerHoldBooking } from '@/lib/types';

/**
 * Saves the choices as a draft booking and holds the packing appointment if Full Service is on.
 * Errors: VALIDATION, SLOT_FULL, DEADLINE_PASSED.
 */
export async function createBooking(input: BookingDraftInput): Promise<Result<SummerHoldBooking>> {
  // STUB(summerHold): replace with real implementation
  return notImplemented('createBooking', 'lib/live/actions/summerHold.ts');
}

/** Pays the registration; Dibs Protect holds it. Errors: PAYMENT_FAILED, DEADLINE_PASSED, REFERRAL_INVALID. */
export async function payRegistration(
  bookingId: string,
  referralCode: string,
): Promise<Result<SummerHoldBooking>> {
  // STUB(summerHold): replace with real implementation
  return notImplemented('payRegistration', 'lib/live/actions/summerHold.ts');
}

/** Creates a link a parent can open without signing in. */
export async function createParentPayLink(
  bookingId: string,
): Promise<Result<{ token: string; path: string }>> {
  // STUB(summerHold): replace with real implementation
  return notImplemented('createParentPayLink', 'lib/live/actions/summerHold.ts');
}

/** Errors: CONFLICT (already cancelled). */
export async function cancelBooking(bookingId: string): Promise<Result<MyBooking>> {
  // STUB(summerHold): replace with real implementation
  return notImplemented('cancelBooking', 'lib/live/actions/summerHold.ts');
}

/** Errors: PAYMENT_FAILED, DEADLINE_PASSED. */
export async function payBalance(bookingId: string): Promise<Result<MyBooking>> {
  // STUB(summerHold): replace with real implementation
  return notImplemented('payBalance', 'lib/live/actions/summerHold.ts');
}

/** Public: a parent pays through their link. Errors: PAYMENT_FAILED, NOT_FOUND. */
export async function payAsParent(view: ParentPayView): Promise<Result<ParentPayView>> {
  // STUB(summerHold): replace with real implementation
  return notImplemented('payAsParent', 'lib/live/actions/summerHold.ts');
}
