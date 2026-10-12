import { currentCampusId, simulate } from '@/lib/dev';
import { INTAKE_HOLD_UNTIL } from '@/lib/fixtures/goods';
import type { Result } from '@/lib/result';
import type { GoodsIntakeInput, GoodsItem } from '@/lib/types';

/** Records a new Goods item. The backend sets `holdUntil` and keeps the item unlisted until then. */
export async function intakeGoods(input: GoodsIntakeInput): Promise<Result<GoodsItem>> {
  // STUB(goods): replace with real implementation
  return simulate<GoodsItem>({
    id: 'g_new',
    campusId: currentCampusId(),
    title: input.title,
    category: input.category || 'other',
    photos: input.photos,
    priceCents: input.priceCents ?? 0,
    costCents: input.costCents ?? undefined,
    serialNumber: input.serialNumber || undefined,
    holdUntil: INTAKE_HOLD_UNTIL,
    status: 'holding',
    intakeDate: '2026-10-12T19:00:00Z',
  });
}

/** Errors: CONFLICT (still in its hold period). */
export async function listGoods(item: GoodsItem): Promise<Result<GoodsItem>> {
  // STUB(goods): replace with real implementation
  return simulate<GoodsItem>({ ...item, status: 'listed' });
}

export async function markGoodsSold(item: GoodsItem): Promise<Result<GoodsItem>> {
  // STUB(goods): replace with real implementation
  return simulate<GoodsItem>({ ...item, status: 'sold' });
}

export async function disposeGoods(item: GoodsItem): Promise<Result<GoodsItem>> {
  // STUB(goods): replace with real implementation
  return simulate<GoodsItem>({ ...item, status: 'disposed' });
}
