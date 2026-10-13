// Pages import from this file. Each function runs its Demo version (fixtures, lib/demo/queries/orders.ts)
// or its Live version (your code, lib/live/queries/orders.ts), depending on the data source picked in
// the preview panel (/dev). Nothing else belongs here.

import { choose } from '@/lib/dev/choose';
import * as demo from '@/lib/demo/queries/orders';
import * as live from '@/lib/live/queries/orders';

export const getMyOrders = choose(demo.getMyOrders, live.getMyOrders);
export const getOrder = choose(demo.getOrder, live.getOrder);
