import { simulate } from '@/lib/dev';
import { listings } from '@/lib/fixtures/listings';
import { newHeldOrder, orderRecords } from '@/lib/fixtures/orders';
import { stubOrder } from '@/lib/queries/orders';
import type { Result } from '@/lib/result';
import type { Order } from '@/lib/types';

/** Claims a listing; Dibs Protect holds the payment. Errors: CONFLICT, PAYMENT_FAILED. */
export async function holdToDibs(listingId: string): Promise<Result<Order>> {
  // STUB(orders): replace with real implementation
  const l = listings.find((x) => x.id === listingId) ?? listings[1]!;
  return simulate(stubOrder(newHeldOrder(l.id, l.sellerId)));
}

/** Finishes payment for an order still waiting on it. Errors: PAYMENT_FAILED, CONFLICT. */
export async function payOrder(orderId: string): Promise<Result<Order>> {
  // STUB(orders): replace with real implementation
  const rec = orderRecords.find((x) => x.id === orderId) ?? orderRecords[2]!;
  return simulate<Order>({ ...stubOrder(rec), status: 'held' });
}

/** Errors: VALIDATION, CONFLICT. */
export async function makeOffer(
  listingId: string,
  offerCents: number,
): Promise<Result<{ listingId: string; offerCents: number }>> {
  // STUB(orders): replace with real implementation
  return simulate({ listingId, offerCents });
}

/**
 * Seller enters the buyer's code. The backend checks it.
 * Errors: CODE_INVALID (the order then shows fewer attemptsRemaining), ATTEMPTS_EXCEEDED.
 */
export async function enterHandoffCode(orderId: string, code: string): Promise<Result<Order>> {
  // STUB(orders): replace with real implementation
  void code;
  const rec = orderRecords.find((x) => x.id === orderId) ?? orderRecords[1]!;
  return simulate<Order>({ ...stubOrder(rec), status: 'released', attemptsRemaining: undefined });
}

/** Errors: CONFLICT (already released). */
export async function cancelOrder(orderId: string): Promise<Result<Order>> {
  // STUB(orders): replace with real implementation
  const rec = orderRecords.find((x) => x.id === orderId) ?? orderRecords[0]!;
  return simulate<Order>({ ...stubOrder(rec), status: 'cancelled', handoffCodeVisibleToBuyer: undefined });
}
