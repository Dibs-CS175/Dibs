'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/queries/listings.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { notImplemented } from '@/lib/live/not-implemented';
import { fail, ok, type Result } from '@/lib/result';
import { createSupabaseServerClient } from '@/lib/supabase/server'; // necessary to access database
import type { ListingCardView, ListingDetail, ListingSearch, Page } from '@/lib/types';

/**
 * Search, filter and sort happen on the backend, scoped to the user's campus. Return pages of results:
 * the first when no cursor is passed, then the next page for each `nextCursor`.
 */
export async function searchListings(params: ListingSearch): Promise<Result<Page<ListingCardView>>> {
  const pageSize = 12;
  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return fail('NOT_SIGNED_IN', 'Sign in to view listings.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('campus_id')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (profileError) return fail('UNKNOWN', 'Could not verify your campus.');
  if (!profile) return fail('NOT_FOUND', 'User profile not found.');

  const offset = params.cursor === undefined ? 0 : Number(params.cursor);
  if (!Number.isSafeInteger(offset) || offset < 0) {
    return fail('VALIDATION', 'Invalid listing page cursor.');
  }
  if (params.sort && !['newest', 'price_asc', 'price_desc'].includes(params.sort)) {
    return fail('VALIDATION', 'Invalid listing sort order.');
  }

  let query = supabase
    .from('listings')
    .select(
      'id, campus_id, seller_id, source, title, description, price_cents, condition, category, housing_fit, status, created_at, listing_photos(photo_url, position), seller:users!listings_seller_id_fkey(id, first_name, last_initial, verified), saved_listings(listing_id)',
    )
    .eq('campus_id', profile.campus_id)
    .eq('status', 'active');

  if (params.q?.trim()) {
    const searchTerm = params.q.trim().replace(/[\\%_]/g, '\\$&');
    query = query.ilike('title', `%${searchTerm}%`);
  }
  if (params.category) query = query.eq('category', params.category);
  if (params.minCents !== undefined) query = query.gte('price_cents', params.minCents);
  if (params.maxCents !== undefined) query = query.lte('price_cents', params.maxCents);
  if (params.conditions?.length) query = query.in('condition', params.conditions);
  if (params.fits?.length) query = query.in('housing_fit', params.fits);
  if (params.source) query = query.eq('source', params.source);
  if (params.freeOnly) query = query.eq('price_cents', 0);

  if (params.sort === 'price_asc') {
    query = query.order('price_cents', { ascending: true }).order('id', { ascending: true });
  } else if (params.sort === 'price_desc') {
    query = query.order('price_cents', { ascending: false }).order('id', { ascending: true });
  } else {
    query = query.order('created_at', { ascending: false }).order('id', { ascending: true });
  }

  const { data, error } = await query.range(offset, offset + pageSize);
  if (error) return fail('UNKNOWN', 'Could not search listings.');

  const hasMore = data.length > pageSize;
  const items: ListingCardView[] = data.slice(0, pageSize).map((row) => {
    const seller = Array.isArray(row.seller) ? row.seller[0] : row.seller;
    const photos = [...row.listing_photos].sort((a, b) => a.position - b.position);

    return {
      listing: {
        id: row.id,
        campusId: row.campus_id,
        sellerId: row.seller_id ?? 'dibs',
        source: row.source,
        title: row.title,
        description: row.description,
        priceCents: row.price_cents,
        condition: row.condition,
        category: row.category,
        housingFit: row.housing_fit,
        photos: photos.map((photo) => photo.photo_url),
        status: row.status,
        createdAt: row.created_at,
      },
      seller: seller
        ? {
            id: seller.id,
            firstName: seller.first_name,
            lastInitial: seller.last_initial,
            verified: seller.verified,
          }
        : { id: 'dibs', firstName: 'Dibs', lastInitial: '', verified: false },
      saved: row.saved_listings.length > 0,
    };
  });

  return ok({
    items,
    nextCursor: hasMore ? String(offset + pageSize) : null,
  });
}

export async function getListing(listingId: string): Promise<Result<ListingDetail>> {
  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return fail('NOT_SIGNED_IN', 'Sign in to view listings.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('campus_id')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (profileError) return fail('UNKNOWN', 'Could not verify your campus.');
  if (!profile) return fail('NOT_FOUND', 'User profile not found.');

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select(
      'id, campus_id, seller_id, source, title, description, price_cents, condition, category, housing_fit, status, created_at, listing_photos(photo_url, position), saved_listings(listing_id)',
    )
    .eq('campus_id', profile.campus_id)
    .eq('status', 'active')
    .eq('id', listingId)
    .maybeSingle();

  if (listingError) return fail('UNKNOWN', 'Could not retrieve this listing.');
  if (!listing) return fail('NOT_FOUND', 'Listing not found.');
  if (!listing.seller_id) return fail('NOT_FOUND', 'Seller profile not found.');

  const { data: seller, error: sellerError } = await supabase
    .from('users')
    .select(
      'id, campus_id, first_name, last_initial, email, housing_type, role, verified, trades_count, member_since, referral_code',
    )
    .eq('id', listing.seller_id)
    .maybeSingle();

  if (sellerError) return fail('UNKNOWN', 'Could not retrieve the seller profile.');
  if (!seller) return fail('NOT_FOUND', 'Seller profile not found.');

  const photos = [...listing.listing_photos].sort((a, b) => a.position - b.position);

  return ok({
    listing: {
      id: listing.id,
      campusId: listing.campus_id,
      sellerId: listing.seller_id,
      source: listing.source,
      title: listing.title,
      description: listing.description,
      priceCents: listing.price_cents,
      condition: listing.condition,
      category: listing.category,
      housingFit: listing.housing_fit,
      photos: photos.map((photo) => photo.photo_url),
      status: listing.status,
      createdAt: listing.created_at,
    },
    seller: {
      id: seller.id,
      campusId: seller.campus_id,
      firstName: seller.first_name,
      lastInitial: seller.last_initial,
      email: seller.email,
      housingType: seller.housing_type,
      role: seller.role,
      verified: seller.verified,
      tradesCount: seller.trades_count,
      memberSince: seller.member_since,
      referralCode: seller.referral_code,
    },
    saved: listing.saved_listings.length > 0,
    isOwn: listing.seller_id === authData.user.id,
  });
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
