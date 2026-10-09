import { simulate } from '@/lib/dev';
import type { Result } from '@/lib/result';
import type { Listing, ListingDraft, ListingDraftInput } from '@/lib/types';
import { listings } from '@/lib/fixtures/listings';

export async function toggleSave(
  listingId: string,
  saved: boolean,
): Promise<Result<{ listingId: string; saved: boolean }>> {
  // STUB(listings): replace with real implementation
  return simulate({ listingId, saved });
}

export async function saveListingDraft(
  input: ListingDraftInput,
  draftId?: string,
): Promise<Result<ListingDraft>> {
  // STUB(listings): replace with real implementation
  return simulate<ListingDraft>({ ...input, id: draftId ?? 'draft_1', savedAt: '2026-10-08T19:00:00Z' });
}

export async function publishListing(draftId: string): Promise<Result<Listing>> {
  // STUB(listings): replace with real implementation
  void draftId;
  return simulate<Listing>({ ...listings[29]!, id: 'l_new', status: 'active' });
}

export async function removeListing(listingId: string): Promise<Result<{ listingId: string }>> {
  // STUB(listings): replace with real implementation
  return simulate({ listingId });
}
