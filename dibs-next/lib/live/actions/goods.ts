'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/actions/goods.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { notImplemented } from '@/lib/live/not-implemented';
import type { Result } from '@/lib/result';
import type { GoodsIntakeInput, GoodsItem } from '@/lib/types';

/** Records a new Goods item. The backend sets `holdUntil` and keeps the item unlisted until then. */
export async function intakeGoods(input: GoodsIntakeInput): Promise<Result<GoodsItem>> {
  // STUB(goods): replace with real implementation
  return notImplemented('intakeGoods', 'lib/live/actions/goods.ts');
}

/** Errors: CONFLICT (still in its hold period). */
export async function listGoods(item: GoodsItem): Promise<Result<GoodsItem>> {
  // STUB(goods): replace with real implementation
  return notImplemented('listGoods', 'lib/live/actions/goods.ts');
}

export async function markGoodsSold(item: GoodsItem): Promise<Result<GoodsItem>> {
  // STUB(goods): replace with real implementation
  return notImplemented('markGoodsSold', 'lib/live/actions/goods.ts');
}

export async function disposeGoods(item: GoodsItem): Promise<Result<GoodsItem>> {
  // STUB(goods): replace with real implementation
  return notImplemented('disposeGoods', 'lib/live/actions/goods.ts');
}
