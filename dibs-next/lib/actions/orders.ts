// Pages import from this file. Each function runs its Demo version (fixtures, lib/demo/actions/orders.ts)
// or its Live version (your code, lib/live/actions/orders.ts), depending on the data source picked in
// the preview panel (/dev). Nothing else belongs here.

import { choose } from '@/lib/dev/choose';
import * as demo from '@/lib/demo/actions/orders';
import * as live from '@/lib/live/actions/orders';

export const holdToDibs = choose(demo.holdToDibs, live.holdToDibs);
export const payOrder = choose(demo.payOrder, live.payOrder);
export const makeOffer = choose(demo.makeOffer, live.makeOffer);
export const enterHandoffCode = choose(demo.enterHandoffCode, live.enterHandoffCode);
export const cancelOrder = choose(demo.cancelOrder, live.cancelOrder);
