// Pages import from this file. Each function runs its Demo version (fixtures, lib/demo/actions/goods.ts)
// or its Live version (your code, lib/live/actions/goods.ts), depending on the data source picked in
// the preview panel (/dev). Nothing else belongs here.

import { choose } from '@/lib/dev/choose';
import * as demo from '@/lib/demo/actions/goods';
import * as live from '@/lib/live/actions/goods';

export const intakeGoods = choose(demo.intakeGoods, live.intakeGoods);
export const listGoods = choose(demo.listGoods, live.listGoods);
export const markGoodsSold = choose(demo.markGoodsSold, live.markGoodsSold);
export const disposeGoods = choose(demo.disposeGoods, live.disposeGoods);
