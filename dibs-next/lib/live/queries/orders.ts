'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/queries/orders.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { notImplemented } from '@/lib/live/not-implemented';
import type { Result } from '@/lib/result';
import type { OrderDetail, OrderSummary } from '@/lib/types';

export async function getMyOrders(): Promise<Result<OrderSummary[]>> {
  // STUB(orders): replace with real implementation
  return notImplemented('getMyOrders', 'lib/live/queries/orders.ts');
}

export async function getOrder(orderId: string): Promise<Result<OrderDetail>> {
  // STUB(orders): replace with real implementation
  return notImplemented('getOrder', 'lib/live/queries/orders.ts');
}
