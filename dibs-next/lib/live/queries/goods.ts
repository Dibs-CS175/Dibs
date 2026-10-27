'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/queries/goods.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { fail, ok, type Result } from '@/lib/result';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Category, Condition, GoodsItem, GoodsStatus, HousingFit } from '@/lib/types';

const VALID_STATUSES: GoodsStatus[] = ['intake', 'holding', 'listed', 'sold', 'disposed'];

interface JoinedListingPhoto {
  photo_url: string;
  position: number;
}

interface JoinedListing {
  id: string;
  title: string;
  category: Category;
  condition: Condition;
  housing_fit: HousingFit;
  description: string;
  price_cents: number;
  listing_photos?: JoinedListingPhoto[] | null;
}

/** Admin: Goods inventory for the admin's campus, optionally filtered by status on the backend. */
export async function getGoods(status?: GoodsStatus): Promise<Result<GoodsItem[]>> {
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return fail('VALIDATION', 'Invalid goods status filter.');
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return fail('NOT_SIGNED_IN', 'Sign in to view Goods inventory.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('campus_id, role')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (profileError) return fail('UNKNOWN', 'Could not verify your account.');
  if (!profile) return fail('NOT_FOUND', 'User profile not found.');
  if (profile.role !== 'admin') {
    return fail('FORBIDDEN', 'Only admins can view Goods inventory.');
  }

  let query = supabase
    .from('goods_items')
    .select(
      'id, campus_id, listing_id, cost_cents, serial_number, hold_until, status, intake_date, listing:listings!goods_items_listing_id_fkey(id, title, category, condition, housing_fit, description, price_cents, listing_photos(photo_url, position))',
    )
    .eq('campus_id', profile.campus_id)
    .order('intake_date', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) return fail('UNKNOWN', 'Could not load Goods inventory.');

  const items: GoodsItem[] = (data ?? []).map((row) => {
    const rawListing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
    const listing = rawListing as JoinedListing | null | undefined;
    const sortedPhotos = [...(listing?.listing_photos ?? [])].sort(
      (a, b) => a.position - b.position,
    );

    return {
      id: row.id,
      campusId: row.campus_id,
      ...(row.listing_id ? { listingId: row.listing_id } : {}),
      title: listing?.title ?? 'Untitled Goods Item',
      category: listing?.category ?? 'other',
      ...(listing?.condition ? { condition: listing.condition } : {}),
      ...(listing?.housing_fit ? { housingFit: listing.housing_fit } : {}),
      ...(listing?.description !== undefined ? { description: listing.description } : {}),
      photos: sortedPhotos.map((p) => p.photo_url),
      priceCents: listing?.price_cents ?? 0,
      ...(row.cost_cents !== null && row.cost_cents !== undefined
        ? { costCents: row.cost_cents }
        : {}),
      ...(row.serial_number ? { serialNumber: row.serial_number } : {}),
      ...(row.hold_until ? { holdUntil: row.hold_until } : {}),
      status: row.status as GoodsStatus,
      intakeDate: row.intake_date,
    };
  });

  return ok(items);
}