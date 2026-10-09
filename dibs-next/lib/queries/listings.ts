import { simulate } from '@/lib/dev';
import { listings } from '@/lib/fixtures/listings';
import { me, users } from '@/lib/fixtures/users';
import type { Result } from '@/lib/result';
import type { Listing, ListingCardView, ListingDetail, ListingSearch, Page } from '@/lib/types';

const card = (l: Listing): ListingCardView => {
  const u = users.find((x) => x.id === l.sellerId)!;
  return {
    listing: l,
    seller: { id: u.id, firstName: u.firstName, lastInitial: u.lastInitial, verified: u.verified },
    saved: l.id === 'l08' || l.id === 'l25',
  };
};

/**
 * Search, filter and sort happen on the backend. The stub ignores `params` and returns fixture pages:
 * the first page without a cursor, the second page when a cursor is passed.
 */
export async function searchListings(params: ListingSearch): Promise<Result<Page<ListingCardView>>> {
  // STUB(listings): replace with real implementation
  const active = listings.filter((l) => l.status === 'active');
  const page = params.cursor
    ? { items: active.slice(12).map(card), nextCursor: null }
    : { items: active.slice(0, 12).map(card), nextCursor: 'page-2' };
  return simulate<Page<ListingCardView>>(page, { items: [], nextCursor: null });
}

export async function getListing(listingId: string): Promise<Result<ListingDetail>> {
  // STUB(listings): replace with real implementation
  const l = listings.find((x) => x.id === listingId) ?? listings[1]!;
  const seller = users.find((u) => u.id === l.sellerId)!;
  return simulate<ListingDetail>({ listing: l, seller, saved: false, isOwn: l.sellerId === me.id });
}

export async function getMyListings(): Promise<Result<ListingCardView[]>> {
  // STUB(listings): replace with real implementation
  return simulate(listings.filter((l) => l.sellerId === me.id).map(card), []);
}

export async function getSavedListings(): Promise<Result<ListingCardView[]>> {
  // STUB(listings): replace with real implementation
  return simulate(
    [listings[7]!, listings[24]!].map((l) => ({ ...card(l), saved: true })),
    [],
  );
}

export async function getSimilarListings(listingId: string): Promise<Result<ListingCardView[]>> {
  // STUB(listings): replace with real implementation
  void listingId;
  return simulate(listings.slice(1, 7).map(card), []);
}
