// Pages import from this file. Each function runs its Demo version (fixtures, lib/demo/queries/pricing.ts)
// or its Live version (your code, lib/live/queries/pricing.ts), depending on the data source picked in
// the preview panel (/dev). Nothing else belongs here.

import { choose } from '@/lib/dev/choose';
import * as demo from '@/lib/demo/queries/pricing';
import * as live from '@/lib/live/queries/pricing';

export const getCheckoutQuote = choose(demo.getCheckoutQuote, live.getCheckoutQuote);
export const getSellerPayoutQuote = choose(demo.getSellerPayoutQuote, live.getSellerPayoutQuote);
export const getSummerHoldQuote = choose(demo.getSummerHoldQuote, live.getSummerHoldQuote);
export const getSummerHoldTeaser = choose(demo.getSummerHoldTeaser, live.getSummerHoldTeaser);
export const getSummerHoldOffers = choose(demo.getSummerHoldOffers, live.getSummerHoldOffers);
