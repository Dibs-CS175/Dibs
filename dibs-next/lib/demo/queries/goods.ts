// DEMO versions: fixture-backed stand-ins shown when the data source is Demo (the default).
// They are the working mockup, not production code. Write real code in lib/live/queries/goods.ts.

import { currentCampusId, simulate } from '@/lib/dev';
import { goods } from '@/lib/fixtures/goods';
import type { Result } from '@/lib/result';
import type { GoodsItem, GoodsStatus } from '@/lib/types';

/** Admin: Goods inventory for the admin's campus, optionally filtered by status on the backend. */
export async function getGoods(status?: GoodsStatus): Promise<Result<GoodsItem[]>> {
  const campus = goods.filter((g) => g.campusId === currentCampusId());
  return simulate(status ? campus.filter((g) => g.status === status) : campus, []);
}
