import { simulate } from '@/lib/dev';
import { listings } from '@/lib/fixtures/listings';
import { orderExtras, orders, storageExtras } from '@/lib/fixtures/orders';
import { me, users } from '@/lib/fixtures/users';
import type { Result } from '@/lib/result';
import type { Order, OrderDetail, OrderSummary } from '@/lib/types';

const summary = (o: Order): OrderSummary => {
  const l = listings.find((x) => x.id === o.listingId)!;
  const viewerRole = o.buyerId === me.id ? 'buyer' : 'seller';
  const other = users.find((u) => u.id === (viewerRole === 'buyer' ? o.sellerId : o.buyerId))!;
  return {
    order: viewerRole === 'buyer' ? o : { ...o, handoffCodeVisibleToBuyer: undefined },
    listing: { id: l.id, title: l.title, photos: l.photos },
    viewerRole,
    counterpart: { id: other.id, firstName: other.firstName, lastInitial: other.lastInitial },
  };
};

export async function getMyOrders(): Promise<Result<OrderSummary[]>> {
  // STUB(orders): replace with real implementation
  return simulate(orders.map(summary), []);
}

export async function getOrder(orderId: string): Promise<Result<OrderDetail>> {
  // STUB(orders): replace with real implementation
  const o = orders.find((x) => x.id === orderId) ?? orders[0]!;
  return simulate<OrderDetail>({
    ...summary(o),
    ...orderExtras[o.id]!,
    ...(storageExtras[o.id] ?? {
      pickupAtStorage: false,
      storagePickupSlot: null,
      canChooseStorageSlot: false,
    }),
  });
}
