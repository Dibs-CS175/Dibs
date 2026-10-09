import { simulate } from '@/lib/dev';
import { listings } from '@/lib/fixtures/listings';
import { newHeldOrder, orders } from '@/lib/fixtures/orders';
import type { Result } from '@/lib/result';
import type { Order } from '@/lib/types';

/** Claims a listing and holds payment with Dibs Protect. Errors: CONFLICT, PAYMENT_FAILED. */
export async function holdToDibs(listingId: string): Promise<Result<Order>> {
  // STUB(orders): replace with real implementation
  const l = listings.find((x) => x.id === listingId) ?? listings[1]!;
  return simulate(newHeldOrder(l.id, l.sellerId, l.priceCents));
}

export async function makeOffer(
  listingId: string,
  offerCents: number,
): Promise<Result<{ listingId: string; offerCents: number }>> {
  // STUB(orders): replace with real implementation
  return simulate({ listingId, offerCents });
}

/** Seller enters the buyer's code. Errors: CODE_INVALID (message says how many attempts remain). */
export async function enterHandoffCode(orderId: string, code: string): Promise<Result<Order>> {
  // STUB(orders): replace with real implementation
  void code;
  const o = orders.find((x) => x.id === orderId) ?? orders[1]!;
  return simulate<Order>({ ...o, status: 'released' });
}

export async function cancelOrder(orderId: string): Promise<Result<Order>> {
  // STUB(orders): replace with real implementation
  const o = orders.find((x) => x.id === orderId) ?? orders[0]!;
  return simulate<Order>({ ...o, status: 'cancelled', handoffCodeVisibleToBuyer: undefined });
}
