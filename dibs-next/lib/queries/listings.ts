// Pages import from this file. Each function runs its Demo version (fixtures, lib/demo/queries/listings.ts)
// or its Live version (your code, lib/live/queries/listings.ts), depending on the data source picked in
// the preview panel (/dev). Nothing else belongs here.

import { choose } from '@/lib/dev/choose';
import * as demo from '@/lib/demo/queries/listings';
import * as live from '@/lib/live/queries/listings';

export const searchListings = choose(demo.searchListings, live.searchListings);
export const getListing = choose(demo.getListing, live.getListing);
export const getMyListings = choose(demo.getMyListings, live.getMyListings);
export const getSavedListings = choose(demo.getSavedListings, live.getSavedListings);
export const getSimilarListings = choose(demo.getSimilarListings, live.getSimilarListings);
