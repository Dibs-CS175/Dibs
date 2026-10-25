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
  // STUB(listings): replace with real implementation

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

/** Errors: VALIDATION, RATE_LIMITED. */
export async function publishListing(draftId: string): Promise<Result<Listing>> {
  // STUB(listings): replace with real implementation
  return notImplemented('publishListing', 'lib/live/actions/listings.ts');
}

export async function removeListing(listingId: string): Promise<Result<{ listingId: string }>> {
  // STUB(listings): replace with real implementation
  return notImplemented('removeListing', 'lib/live/actions/listings.ts');
}
