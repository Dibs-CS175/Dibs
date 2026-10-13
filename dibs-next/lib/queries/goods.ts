// Pages import from this file. Each function runs its Demo version (fixtures, lib/demo/queries/goods.ts)
// or its Live version (your code, lib/live/queries/goods.ts), depending on the data source picked in
// the preview panel (/dev). Nothing else belongs here.

import { choose } from '@/lib/dev/choose';
import * as demo from '@/lib/demo/queries/goods';
import * as live from '@/lib/live/queries/goods';

export const getGoods = choose(demo.getGoods, live.getGoods);
