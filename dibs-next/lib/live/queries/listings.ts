'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/queries/listings.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { notImplemented } from '@/lib/live/not-implemented';
import type { Result } from '@/lib/result';
import type { ListingCardView, ListingDetail, ListingSearch, Page } from '@/lib/types';

/**
 * Search, filter and sort happen on the backend, scoped to the user's campus. Return pages of results:
 * the first when no cursor is passed, then the next page for each `nextCursor`.
 */
export async function searchListings(params: ListingSearch): Promise<Result<Page<ListingCardView>>> {
  // STUB(listings): replace with real implementation
  return notImplemented('searchListings', 'lib/live/queries/listings.ts');
}

export async function getListing(listingId: string): Promise<Result<ListingDetail>> {
  // STUB(listings): replace with real implementation
  return notImplemented('getListing', 'lib/live/queries/listings.ts');
}

export async function getMyListings(): Promise<Result<ListingCardView[]>> {
  // STUB(listings): replace with real implementation
  return notImplemented('getMyListings', 'lib/live/queries/listings.ts');
}

export async function getSavedListings(): Promise<Result<ListingCardView[]>> {
  // STUB(listings): replace with real implementation
  return notImplemented('getSavedListings', 'lib/live/queries/listings.ts');
}

export async function getSimilarListings(listingId: string): Promise<Result<ListingCardView[]>> {
  // STUB(listings): replace with real implementation
  return notImplemented('getSimilarListings', 'lib/live/queries/listings.ts');
}
