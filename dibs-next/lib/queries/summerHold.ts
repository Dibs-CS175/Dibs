// Pages import from this file. Each function runs its Demo version (fixtures, lib/demo/queries/summerHold.ts)
// or its Live version (your code, lib/live/queries/summerHold.ts), depending on the data source picked in
// the preview panel (/dev). Nothing else belongs here.

import { choose } from '@/lib/dev/choose';
import * as demo from '@/lib/demo/queries/summerHold';
import * as live from '@/lib/live/queries/summerHold';

export const getMyBooking = choose(demo.getMyBooking, live.getMyBooking);
export const getPackingSlots = choose(demo.getPackingSlots, live.getPackingSlots);
export const getPickupSlots = choose(demo.getPickupSlots, live.getPickupSlots);
export const getParentPayView = choose(demo.getParentPayView, live.getParentPayView);
