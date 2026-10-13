// DEMO versions: fixture-backed stand-ins shown when the data source is Demo (the default).
// They are the working mockup, not production code. Write real code in lib/live/actions/listings.ts.

import { currentCampusId, simulate } from '@/lib/dev';
import { listings } from '@/lib/fixtures/listings';
import type { Result } from '@/lib/result';
import type { Listing, ListingDraft, ListingDraftInput } from '@/lib/types';

export async function toggleSave(
  listingId: string,
  saved: boolean,
): Promise<Result<{ listingId: string; saved: boolean }>> {
  return simulate({ listingId, saved });
}

/** Errors: VALIDATION. */
export async function saveListingDraft(
  input: ListingDraftInput,
  draftId?: string,
): Promise<Result<ListingDraft>> {
  return simulate<ListingDraft>({ ...input, id: draftId ?? 'draft_1', savedAt: '2026-10-12T19:00:00Z' });
}

/** Errors: VALIDATION, RATE_LIMITED. */
export async function publishListing(draftId: string): Promise<Result<Listing>> {
  void draftId;
  return simulate<Listing>({ ...listings[29]!, id: 'l_new', campusId: currentCampusId(), status: 'active' });
}

export async function removeListing(listingId: string): Promise<Result<{ listingId: string }>> {
  return simulate({ listingId });
}
