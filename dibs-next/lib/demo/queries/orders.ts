// DEMO versions: fixture-backed stand-ins shown when the data source is Demo (the default).
// They are the working mockup, not production code. Write real code in lib/live/queries/orders.ts.

import { simulate } from '@/lib/dev';
import { meetupSpots } from '@/lib/fixtures/campuses';
import { listings } from '@/lib/fixtures/listings';
import { orderExtras, orderRecords, newHeldOrder, type OrderRecord } from '@/lib/fixtures/orders';
import { findUser, me } from '@/lib/fixtures/users';
import { stubCheckoutQuote, stubPayoutQuote } from '@/lib/demo/queries/pricing';
import type { Result } from '@/lib/result';
import type { Order, OrderDetail, OrderSummary } from '@/lib/types';

/** Stub helper: an order record with its quotes from the pricing stub helpers. */
export function stubOrder(rec: OrderRecord): Order {
  const l = listings.find((x) => x.id === rec.listingId)!;
  return { ...rec, quote: stubCheckoutQuote(l), payoutQuote: stubPayoutQuote(rec.campusId, l.priceCents) };
}

const summary = (o: Order): OrderSummary => {
  const l = listings.find((x) => x.id === o.listingId)!;
  const viewerRole = o.buyerId === me.id ? 'buyer' : 'seller';
  const other = findUser(viewerRole === 'buyer' ? o.sellerId : o.buyerId);
  return {
    // The buyer never sees the seller's attempts; the seller never sees the code.
    order:
      viewerRole === 'buyer'
        ? { ...o, attemptsRemaining: undefined }
        : { ...o, handoffCodeVisibleToBuyer: undefined },
    listing: { id: l.id, title: l.title, photos: l.photos },
    viewerRole,
    counterpart: { id: other.id, firstName: other.firstName, lastInitial: other.lastInitial },
  };
};

export async function getMyOrders(): Promise<Result<OrderSummary[]>> {
  return simulate(
    orderRecords.map((r) => summary(stubOrder(r))),
    [],
  );
}

export async function getOrder(orderId: string): Promise<Result<OrderDetail>> {
  const rec =
    orderRecords.find((x) => x.id === orderId) ??
    (orderId === 'o_new' ? newHeldOrder('l02', 'u_s05') : orderRecords[0]!);
  const extras = orderExtras[rec.id] ?? orderExtras.o1!;
  return simulate<OrderDetail>({
    ...summary(stubOrder(rec)),
    ...extras,
    meetupSpot: meetupSpots.find((s) => s.id === rec.meetupSpotId) ?? null,
  });
}
