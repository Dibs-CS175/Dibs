// Pages import from this file. Each function runs its Demo version (fixtures, lib/demo/actions/summerHold.ts)
// or its Live version (your code, lib/live/actions/summerHold.ts), depending on the data source picked in
// the preview panel (/dev). Nothing else belongs here.

import { choose } from '@/lib/dev/choose';
import * as demo from '@/lib/demo/actions/summerHold';
import * as live from '@/lib/live/actions/summerHold';

export const createBooking = choose(demo.createBooking, live.createBooking);
export const payRegistration = choose(demo.payRegistration, live.payRegistration);
export const createParentPayLink = choose(demo.createParentPayLink, live.createParentPayLink);
export const cancelBooking = choose(demo.cancelBooking, live.cancelBooking);
export const payBalance = choose(demo.payBalance, live.payBalance);
export const payAsParent = choose(demo.payAsParent, live.payAsParent);
