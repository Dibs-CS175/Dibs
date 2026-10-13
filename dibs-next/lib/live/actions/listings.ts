'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/actions/listings.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { notImplemented } from '@/lib/live/not-implemented';
import type { Result } from '@/lib/result';
import type { Listing, ListingDraft, ListingDraftInput } from '@/lib/types';

export async function toggleSave(
  listingId: string,
  saved: boolean,
): Promise<Result<{ listingId: string; saved: boolean }>> {
  // STUB(listings): replace with real implementation
  return notImplemented('toggleSave', 'lib/live/actions/listings.ts');
}

/** Errors: VALIDATION. */
export async function saveListingDraft(
  input: ListingDraftInput,
  draftId?: string,
): Promise<Result<ListingDraft>> {
  // STUB(listings): replace with real implementation
  return notImplemented('saveListingDraft', 'lib/live/actions/listings.ts');
}

/** Errors: VALIDATION, RATE_LIMITED. */
export async function publishListing(draftId: string): Promise<Result<Listing>> {
  // STUB(listings): replace with real implementation
  return notImplemented('publishListing', 'lib/live/actions/listings.ts');
}

export async function removeListing(listingId: string): Promise<Result<{ listingId: string }>> {
  // STUB(listings): replace with real implementation
  return notImplemented('removeListing', 'lib/live/actions/listings.ts');
}
