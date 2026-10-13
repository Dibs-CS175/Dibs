// Pages import from this file. Each function runs its Demo version (fixtures, lib/demo/actions/listings.ts)
// or its Live version (your code, lib/live/actions/listings.ts), depending on the data source picked in
// the preview panel (/dev). Nothing else belongs here.

import { choose } from '@/lib/dev/choose';
import * as demo from '@/lib/demo/actions/listings';
import * as live from '@/lib/live/actions/listings';

export const toggleSave = choose(demo.toggleSave, live.toggleSave);
export const saveListingDraft = choose(demo.saveListingDraft, live.saveListingDraft);
export const publishListing = choose(demo.publishListing, live.publishListing);
export const removeListing = choose(demo.removeListing, live.removeListing);
