'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/actions/listings.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { notImplemented } from '@/lib/live/not-implemented';
import { CATEGORIES, CONDITIONS, HOUSING_FITS } from '@/lib/config/app';
import { fail, ok, type Result } from '@/lib/result';
import { createSupabaseServerClient } from '@/lib/supabase/server'; // necessary to access database
import type { Listing, ListingDraft, ListingDraftInput } from '@/lib/types';

export async function toggleSave(
  listingId: string,
  saved: boolean,
): Promise<Result<{ listingId: string; saved: boolean }>> {
  // first verifies user
  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return fail('NOT_SIGNED_IN', 'Sign in to save listings.');
  }

  // checks for if the actions is requesting a listing be saved. 
  if (saved) {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('campus_id')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileError) return fail('UNKNOWN', 'Could not verify your campus.');
    if (!profile) return fail('NOT_FOUND', 'User profile not found.');

    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('campus_id')
      .eq('id', listingId)
      .maybeSingle();

    if (listingError) return fail('UNKNOWN', 'Could not verify this listing.');
    if (!listing || listing.campus_id !== profile.campus_id) {
      return fail('NOT_FOUND', 'Listing not found.');
    }

    const { error } = await supabase.from('saved_listings').upsert(
      {
        campus_id: profile.campus_id,
        user_id: authData.user.id,
        listing_id: listingId,
      },
      { onConflict: 'user_id,listing_id' },
    );

    if (error) return fail('UNKNOWN', 'Could not save this listing.');
  } else { // if listing is not being saved, removes listing from saved_listing tables. 
    const { error } = await supabase
      .from('saved_listings')
      .delete()
      .eq('user_id', authData.user.id)
      .eq('listing_id', listingId);

    if (error) return fail('UNKNOWN', 'Could not remove this saved listing.');
  }

  return ok({ listingId, saved });
}

/** Errors: VALIDATION. */
export async function saveListingDraft(
  input: ListingDraftInput,
  draftId?: string,
): Promise<Result<ListingDraft>> {
  if (
    !input ||
    !Array.isArray(input.photos) ||
    !input.photos.every((photo) => typeof photo === 'string') ||
    typeof input.title !== 'string' ||
    typeof input.description !== 'string' ||
    !(input.category === '' || CATEGORIES.some(({ id }) => id === input.category)) ||
    !(input.condition === '' || CONDITIONS.some(({ id }) => id === input.condition)) ||
    !(input.housingFit === '' || HOUSING_FITS.some(({ id }) => id === input.housingFit)) ||
    !(
      input.priceCents === null ||
      (Number.isInteger(input.priceCents) && input.priceCents >= 0)
    )
  ) {
    return fail('VALIDATION', 'Check the listing draft fields and try again.');
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return fail('NOT_SIGNED_IN', 'Sign in to save listing drafts.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('campus_id')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (profileError) return fail('UNKNOWN', 'Could not verify your account.');
  if (!profile) return fail('NOT_FOUND', 'User profile not found.');

  const savedAt = new Date().toISOString();
  const draftFields = {
    photos: input.photos,
    title: input.title,
    category: input.category || null,
    condition: input.condition || null,
    housing_fit: input.housingFit || null,
    description: input.description,
    price_cents: input.priceCents,
    saved_at: savedAt,
    updated_at: savedAt,
  };
  const selectedFields =
    'id, photos, title, category, condition, housing_fit, description, price_cents, saved_at';

  if (draftId) {
    const { data, error } = await supabase
      .from('listing_drafts')
      .update(draftFields)
      .eq('id', draftId)
      .eq('seller_id', authData.user.id)
      .select(selectedFields)
      .maybeSingle();

    if (error) return fail('UNKNOWN', 'Could not save the listing draft.');
    if (!data) return fail('NOT_FOUND', 'Listing draft not found.');

    return ok({
      id: data.id,
      photos: data.photos,
      title: data.title,
      category: data.category ?? '',
      condition: data.condition ?? '',
      housingFit: data.housing_fit ?? '',
      description: data.description,
      priceCents: data.price_cents,
      savedAt: data.saved_at,
    });
  }

  const { data, error } = await supabase
    .from('listing_drafts')
    .insert({
      ...draftFields,
      seller_id: authData.user.id,
      campus_id: profile.campus_id,
    })
    .select(selectedFields)
    .single();

  if (error) return fail('UNKNOWN', 'Could not save the listing draft.');

  return ok({
    id: data.id,
    photos: data.photos,
    title: data.title,
    category: data.category ?? '',
    condition: data.condition ?? '',
    housingFit: data.housing_fit ?? '',
    description: data.description,
    priceCents: data.price_cents,
    savedAt: data.saved_at,
  });
}

/** Errors: NOT_SIGNED_IN, NOT_FOUND, VALIDATION, UNKNOWN. */
export async function publishListing(draftId: string): Promise<Result<Listing>> {
  if (typeof draftId !== 'string' || draftId.trim() === '') {
    return fail('VALIDATION', 'Save a complete listing draft before publishing.');
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return fail('NOT_SIGNED_IN', 'Sign in to publish a listing.');
  }

  const { data: draft, error: draftError } = await supabase
    .from('listing_drafts')
    .select(
      'id, campus_id, seller_id, photos, title, category, condition, housing_fit, description, price_cents',
    )
    .eq('id', draftId)
    .eq('seller_id', authData.user.id)
    .maybeSingle();

  if (draftError) return fail('UNKNOWN', 'Could not load the listing draft.');
  if (!draft) return fail('NOT_FOUND', 'Listing draft not found.');

  if (
    !Array.isArray(draft.photos) ||
    !draft.photos.every((photo: unknown) => typeof photo === 'string') ||
    draft.photos.length === 0 ||
    typeof draft.title !== 'string' ||
    !draft.title.trim() ||
    typeof draft.description !== 'string' ||
    !draft.category ||
    !CATEGORIES.some(({ id }) => id === draft.category) ||
    !draft.condition ||
    !CONDITIONS.some(({ id }) => id === draft.condition) ||
    !draft.housing_fit ||
    !HOUSING_FITS.some(({ id }) => id === draft.housing_fit) ||
    !Number.isInteger(draft.price_cents) ||
    draft.price_cents < 0
  ) {
    return fail('VALIDATION', 'Complete all required listing details before publishing.');
  }

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .insert({
      campus_id: draft.campus_id,
      seller_id: draft.seller_id,
      source: 'student',
      seller_type: 'student',
      title: draft.title.trim(),
      description: draft.description,
      price_cents: draft.price_cents,
      condition: draft.condition,
      category: draft.category,
      housing_fit: draft.housing_fit,
    })
    .select(
      'id, campus_id, seller_id, source, title, description, price_cents, condition, category, housing_fit, status, created_at',
    )
    .single();

  if (listingError) return fail('UNKNOWN', 'Could not publish the listing.');

  const { error: photosError } = await supabase.from('listing_photos').insert(
    draft.photos.map((photo_url: string, position: number) => ({
      campus_id: draft.campus_id,
      listing_id: listing.id,
      photo_url,
      position,
    })),
  );

  if (photosError) return fail('UNKNOWN', 'The listing was created, but its photos could not be published.');

  const { error: deleteDraftError } = await supabase
    .from('listing_drafts')
    .delete()
    .eq('id', draft.id)
    .eq('seller_id', authData.user.id);

  if (deleteDraftError) {
    return fail('UNKNOWN', 'The listing was published, but its draft could not be removed.');
  }

  return ok({
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
    photos: draft.photos,
    status: listing.status,
    createdAt: listing.created_at,
  });
}

export async function removeListing(listingId: string): Promise<Result<{ listingId: string }>> {

  if (typeof listingId !== 'string' || listingId.trim() === '') {
    return fail('VALIDATION', 'listingId cannot be found');
  }
  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return fail('NOT_SIGNED_IN', 'Sign in to remove your listing.');
  }
    const {data:selectedListing, error: deleteListingError } = await supabase
    .from('listings')
    .update({
      "status": 'removed'
    })
    .eq('id', listingId)
    .eq('seller_id', authData.user.id)
    .select('id')
    .maybeSingle();

    if(deleteListingError) return fail("UNKNOWN", "Some error/conflict occurred when attempting to delete listing");
    if(!selectedListing) return fail('NOT_FOUND', "No listing found to be remove");
    return ok({listingId});
}
