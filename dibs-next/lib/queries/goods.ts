import { simulate } from '@/lib/dev';
import { goods } from '@/lib/fixtures/goods';
import type { Result } from '@/lib/result';
import type { GoodsItem, GoodsStatus } from '@/lib/types';

/** Goods inventory, optionally filtered by status on the backend. */
export async function getGoods(status?: GoodsStatus): Promise<Result<GoodsItem[]>> {
  // STUB(goods): replace with real implementation
  return simulate(status ? goods.filter((g) => g.status === status) : goods, []);
}
