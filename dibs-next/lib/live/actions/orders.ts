'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/actions/orders.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { notImplemented } from '@/lib/live/not-implemented';
import type { Result } from '@/lib/result';
import type { Order } from '@/lib/types';

/** Claims a listing; Dibs Protect holds the payment. Errors: CONFLICT, PAYMENT_FAILED. */
export async function holdToDibs(listingId: string): Promise<Result<Order>> {
  // STUB(orders): replace with real implementation
  return notImplemented('holdToDibs', 'lib/live/actions/orders.ts');
}

/** Finishes payment for an order still waiting on it. Errors: PAYMENT_FAILED, CONFLICT. */
export async function payOrder(orderId: string): Promise<Result<Order>> {
  // STUB(orders): replace with real implementation
  return notImplemented('payOrder', 'lib/live/actions/orders.ts');
}

/** Errors: VALIDATION, CONFLICT. */
export async function makeOffer(
  listingId: string,
  offerCents: number,
): Promise<Result<{ listingId: string; offerCents: number }>> {
  // STUB(orders): replace with real implementation
  return notImplemented('makeOffer', 'lib/live/actions/orders.ts');
}

/**
 * Seller enters the buyer's code. The backend checks it.
 * Errors: CODE_INVALID (the order then shows fewer attemptsRemaining), ATTEMPTS_EXCEEDED.
 */
export async function enterHandoffCode(orderId: string, code: string): Promise<Result<Order>> {
  // STUB(orders): replace with real implementation
  return notImplemented('enterHandoffCode', 'lib/live/actions/orders.ts');
}

/** Errors: CONFLICT (already released). */
export async function cancelOrder(orderId: string): Promise<Result<Order>> {
  // STUB(orders): replace with real implementation
  return notImplemented('cancelOrder', 'lib/live/actions/orders.ts');
}
