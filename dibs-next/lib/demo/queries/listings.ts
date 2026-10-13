// DEMO versions: fixture-backed stand-ins shown when the data source is Demo (the default).
// They are the working mockup, not production code. Write real code in lib/live/queries/listings.ts.

import { currentCampusId, simulate } from '@/lib/dev';
import { listings } from '@/lib/fixtures/listings';
import { findUser, me } from '@/lib/fixtures/users';
import type { Result } from '@/lib/result';
import type { Listing, ListingCardView, ListingDetail, ListingSearch, Page } from '@/lib/types';

const card = (l: Listing): ListingCardView => {
  const u = findUser(l.sellerId);
  return {
    listing: l,
    seller: { id: u.id, firstName: u.firstName, lastInitial: u.lastInitial, verified: u.verified },
    saved: l.id === 'l12' || l.id === 'l25',
  };
};

const onCampus = () => listings.filter((l) => l.campusId === currentCampusId() && l.status === 'active');

/**
 * Search, filter and sort happen on the backend, scoped to the user's campus. The stub ignores the
 * search fields and returns fixture pages: the first without a cursor, the rest when a cursor is passed.
 */
export async function searchListings(params: ListingSearch): Promise<Result<Page<ListingCardView>>> {
  const active = onCampus();
  const page = params.cursor
    ? { items: active.slice(12).map(card), nextCursor: null }
    : { items: active.slice(0, 12).map(card), nextCursor: active.length > 12 ? 'page-2' : null };
  return simulate<Page<ListingCardView>>(page, { items: [], nextCursor: null });
}

export async function getListing(listingId: string): Promise<Result<ListingDetail>> {
  const l = listings.find((x) => x.id === listingId) ?? listings[1]!;
  return simulate<ListingDetail>({
    listing: l,
    seller: findUser(l.sellerId),
    saved: false,
    isOwn: l.sellerId === me.id,
  });
}

export async function getMyListings(): Promise<Result<ListingCardView[]>> {
  return simulate(listings.filter((l) => l.sellerId === me.id).map(card), []);
}

export async function getSavedListings(): Promise<Result<ListingCardView[]>> {
  return simulate(
    listings.filter((l) => l.id === 'l12' || l.id === 'l25').map((l) => ({ ...card(l), saved: true })),
    [],
  );
}

export async function getSimilarListings(listingId: string): Promise<Result<ListingCardView[]>> {
  return simulate(
    onCampus()
      .filter((l) => l.id !== listingId)
      .slice(0, 6)
      .map(card),
    [],
  );
}
