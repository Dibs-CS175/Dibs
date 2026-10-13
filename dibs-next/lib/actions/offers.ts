// Pages import from this file. Each function runs its Demo version (fixtures, lib/demo/actions/offers.ts)
// or its Live version (your code, lib/live/actions/offers.ts), depending on the data source picked in
// the preview panel (/dev). Nothing else belongs here.

import { choose } from '@/lib/dev/choose';
import * as demo from '@/lib/demo/actions/offers';
import * as live from '@/lib/live/actions/offers';

export const recordOfferShown = choose(demo.recordOfferShown, live.recordOfferShown);
export const recordOfferChoices = choose(demo.recordOfferChoices, live.recordOfferChoices);
