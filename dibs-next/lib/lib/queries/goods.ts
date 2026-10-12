import { currentCampusId, simulate } from '@/lib/dev';
import { goods } from '@/lib/fixtures/goods';
import type { Result } from '@/lib/result';
import type { GoodsItem, GoodsStatus } from '@/lib/types';

/** Admin: Goods inventory for the admin's campus, optionally filtered by status on the backend. */
export async function getGoods(status?: GoodsStatus): Promise<Result<GoodsItem[]>> {
  // STUB(goods): replace with real implementation
  const campus = goods.filter((g) => g.campusId === currentCampusId());
  return simulate(status ? campus.filter((g) => g.status === status) : campus, []);
}
