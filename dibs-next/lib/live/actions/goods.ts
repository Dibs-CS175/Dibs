'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/actions/goods.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { now } from '@/lib/clock';
import { CATEGORIES } from '@/lib/config/app';
import { fail, ok, type Result } from '@/lib/result';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type {
Category,
  Condition,
  GoodsIntakeInput,
  GoodsItem,
  GoodsStatus,
  HousingFit,
} from '@/lib/types';

const HOLD_DURATION_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

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

type AdminAuthResult =
  | { ok: false; error: Result<never> }
  | {
      ok: true;
      supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
      userId: string;
      campusId: string;
    };

async function requireAdmin(): Promise<AdminAuthResult> {
  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return { ok: false, error: fail('NOT_SIGNED_IN', 'Sign in to manage Goods inventory.') };
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('campus_id, role')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (profileError) {
    return { ok: false, error: fail('UNKNOWN', 'Could not verify your account.') };
  }
  if (!profile) {
    return { ok: false, error: fail('NOT_FOUND', 'User profile not found.') };
  }
  if (profile.role !== 'admin') {
    return { ok: false, error: fail('FORBIDDEN', 'Only admins can manage Goods inventory.') };
  }

  return { ok: true, supabase, userId: authData.user.id, campusId: profile.campus_id };
}

function mapRowToGoodsItem(
  row: {
    id: string;
    campus_id: string;
    listing_id: string | null;
    cost_cents: number | null;
    serial_number: string | null;
    hold_until: string | null;
    status: GoodsStatus;
    intake_date: string;
  },
  listing: JoinedListing | null | undefined,
  fallbackItem?: Partial<GoodsItem>,
): GoodsItem {
  const sortedPhotos = [...(listing?.listing_photos ?? [])].sort(
    (a, b) => a.position - b.position,
  );
  const photos =
    sortedPhotos.length > 0
      ? sortedPhotos.map((p) => p.photo_url)
      : (fallbackItem?.photos ?? []);

  return {
    id: row.id,
    campusId: row.campus_id,
    ...(row.listing_id ? { listingId: row.listing_id } : {}),
    title: listing?.title ?? fallbackItem?.title ?? 'Untitled Goods Item',
    category: listing?.category ?? fallbackItem?.category ?? 'other',
    ...(listing?.condition
      ? { condition: listing.condition }
      : fallbackItem?.condition
        ? { condition: fallbackItem.condition }
        : {}),
    ...(listing?.housing_fit
      ? { housingFit: listing.housing_fit }
      : fallbackItem?.housingFit
        ? { housingFit: fallbackItem.housingFit }
        : {}),
    ...(listing?.description !== undefined
      ? { description: listing.description }
      : fallbackItem?.description !== undefined
        ? { description: fallbackItem.description }
        : {}),
    photos,
    priceCents: listing?.price_cents ?? fallbackItem?.priceCents ?? 0,
    ...(row.cost_cents !== null && row.cost_cents !== undefined
      ? { costCents: row.cost_cents }
      : {}),
    ...(row.serial_number ? { serialNumber: row.serial_number } : {}),
    ...(row.hold_until ? { holdUntil: row.hold_until } : {}),
    status: row.status,
    intakeDate: row.intake_date,
  };
}

/** Records a new Goods item. The backend sets `holdUntil` and keeps the item unlisted until then. */
export async function intakeGoods(input: GoodsIntakeInput): Promise<Result<GoodsItem>> {
  if (
    !input ||
    typeof input.title !== 'string' ||
    !input.title.trim() ||
    !Array.isArray(input.photos) ||
    !input.photos.every((p) => typeof p === 'string') ||
    !(input.category === '' || CATEGORIES.some(({ id }) => id === input.category)) ||
    !(input.priceCents === null || (Number.isInteger(input.priceCents) && input.priceCents >= 0)) ||
    !(input.costCents === null || (Number.isInteger(input.costCents) && input.costCents >= 0)) ||
    typeof input.serialNumber !== 'string'
  ) {
    return fail('VALIDATION', 'Check the Goods intake fields and try again.');
  }

  const auth = await requireAdmin();
  if (!auth.ok) return auth.error;
  const { supabase, campusId } = auth;

  const intakeAt = now();
  const holdUntilDate = new Date(intakeAt.getTime() + HOLD_DURATION_DAYS * MS_PER_DAY);
  const intakeDateIso = intakeAt.toISOString();
  const holdUntilIso = holdUntilDate.toISOString();

  const category: Category = input.category || 'other';
  const priceCents = input.priceCents ?? 0;
  const costCents = input.costCents ?? null;
  const serialNumber = input.serialNumber.trim() || null;
  const condition: Condition = 'good';
  const housingFit: HousingFit = 'dorm';

  // Insert backing row into shared `listings` table with `status: 'removed'`
  // so it is NOT browsable on the marketplace until `listGoods` is called after the 30-day hold.
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .insert({
      campus_id: campusId,
      seller_id: null,
      source: 'goods',
      seller_type: 'dibs',
      title: input.title.trim(),
      description: '',
      price_cents: priceCents,
      condition,
      category,
      housing_fit: housingFit,
      status: 'removed',
    })
    .select('id, title, category, condition, housing_fit, description, price_cents')
    .single();

  if (listingError || !listing) {
    return fail('UNKNOWN', 'Could not create the backing marketplace listing for this Goods item.');
  }

  if (input.photos.length > 0) {
    const { error: photosError } = await supabase.from('listing_photos').insert(
      input.photos.map((photo_url, position) => ({
        campus_id: campusId,
        listing_id: listing.id,
        photo_url,
        position,
      })),
    );

    if (photosError) {
      await supabase.from('listings').delete().eq('id', listing.id);
      return fail('UNKNOWN', 'Could not save Goods item photos.');
    }
  }

  const { data: goodsRow, error: goodsError } = await supabase
    .from('goods_items')
    .insert({
      campus_id: campusId,
      listing_id: listing.id,
      cost_cents: costCents,
      serial_number: serialNumber,
      hold_until: holdUntilIso,
      status: 'holding',
      intake_date: intakeDateIso,
    })
    .select('id, campus_id, listing_id, cost_cents, serial_number, hold_until, status, intake_date')
    .single();

  if (goodsError || !goodsRow) {
    await supabase.from('listings').delete().eq('id', listing.id);
    return fail('UNKNOWN', 'Could not record Goods item intake.');
  }

  return ok({
    id: goodsRow.id,
    campusId: goodsRow.campus_id,
    listingId: listing.id,
    title: listing.title,
    category: listing.category as Category,
    condition: listing.condition as Condition,
    housingFit: listing.housing_fit as HousingFit,
    description: listing.description,
    photos: input.photos,
    priceCents: listing.price_cents,
    ...(goodsRow.cost_cents !== null ? { costCents: goodsRow.cost_cents } : {}),
    ...(goodsRow.serial_number ? { serialNumber: goodsRow.serial_number } : {}),
    ...(goodsRow.hold_until ? { holdUntil: goodsRow.hold_until } : {}),
    status: goodsRow.status as GoodsStatus,
    intakeDate: goodsRow.intake_date,
  });
}

/** Errors: CONFLICT (still in its hold period). */
export async function listGoods(item: GoodsItem): Promise<Result<GoodsItem>> {
  if (!item || typeof item.id !== 'string' || !item.id.trim()) {
    return fail('VALIDATION', 'Invalid Goods item.');
  }

  const auth = await requireAdmin();
  if (!auth.ok) return auth.error;
  const { supabase, campusId } = auth;

  const { data: existing, error: fetchError } = await supabase
    .from('goods_items')
    .select(
      'id, campus_id, listing_id, cost_cents, serial_number, hold_until, status, intake_date, listing:listings!goods_items_listing_id_fkey(id, title, category, condition, housing_fit, description, price_cents, listing_photos(photo_url, position))',
    )
    .eq('id', item.id)
    .eq('campus_id', campusId)
    .maybeSingle();

  if (fetchError) return fail('UNKNOWN', 'Could not load Goods item.');
  if (!existing) return fail('NOT_FOUND', 'Goods item not found.');

  if (existing.status === 'sold' || existing.status === 'disposed') {
    return fail('CONFLICT', `Cannot list a Goods item with status "${existing.status}".`);
  }

  // Enforce 30-day compliance hold check against server clock (`now()`).
  const holdUntilStr = existing.hold_until ?? item.holdUntil;
  if (holdUntilStr) {
    const holdUntilTime = new Date(holdUntilStr).getTime();
    if (!Number.isNaN(holdUntilTime) && now().getTime() < holdUntilTime) {
      return fail('CONFLICT', 'This item is still in its 30-day compliance hold period.');
    }
  }

  let listingId = existing.listing_id;
  const rawListing = Array.isArray(existing.listing) ? existing.listing[0] : existing.listing;
  let joinedListing = rawListing as JoinedListing | null | undefined;

  if (!listingId) {
    // If the Goods item was seeded without a backing listing row, create it now with Dibs as seller.
    const { data: createdListing, error: createListingError } = await supabase
      .from('listings')
      .insert({
        campus_id: campusId,
        seller_id: null,
        source: 'goods',
        seller_type: 'dibs',
        title: (item.title || 'Dibs Goods Item').trim(),
        description: item.description ?? '',
        price_cents: item.priceCents ?? 0,
        condition: item.condition ?? 'good',
        category: item.category ?? 'other',
        housing_fit: item.housingFit ?? 'dorm',
        status: 'active',
      })
      .select('id, title, category, condition, housing_fit, description, price_cents')
      .single();

    if (createListingError || !createdListing) {
      return fail('UNKNOWN', 'Could not publish Goods item to marketplace listings.');
    }

    listingId = createdListing.id;
    joinedListing = { ...createdListing, listing_photos: [] };

    if (Array.isArray(item.photos) && item.photos.length > 0) {
      const { error: photosError } = await supabase.from('listing_photos').insert(
        item.photos.map((photo_url, position) => ({
          campus_id: campusId,
          listing_id: listingId!,
          photo_url,
          position,
        })),
      );
      if (photosError) {
        return fail('UNKNOWN', 'Could not publish Goods item photos.');
      }
      joinedListing.listing_photos = item.photos.map((photo_url, position) => ({
        photo_url,
        position,
      }));
    }
  } else {
    // Activate the existing backing row in `public.listings` so it appears in browse and search.
    const { error: activateError } = await supabase
      .from('listings')
      .update({
        status: 'active',
        updated_at: now().toISOString(),
      })
      .eq('id', listingId)
      .eq('campus_id', campusId);

    if (activateError) {
      return fail('UNKNOWN', 'Could not activate Goods listing on the marketplace.');
    }
  }

  const { data: updatedGoods, error: updateGoodsError } = await supabase
    .from('goods_items')
    .update({
      listing_id: listingId,
      status: 'listed',
      updated_at: now().toISOString(),
    })
    .eq('id', existing.id)
    .eq('campus_id', campusId)
    .select('id, campus_id, listing_id, cost_cents, serial_number, hold_until, status, intake_date')
    .single();

  if (updateGoodsError || !updatedGoods) {
    return fail('UNKNOWN', 'Could not update Goods item status to listed.');
  }

  return ok(
    mapRowToGoodsItem(
      { ...updatedGoods, status: updatedGoods.status as GoodsStatus },
      joinedListing,
      item,
    ),
  );
}

export async function markGoodsSold(item: GoodsItem): Promise<Result<GoodsItem>> {
  if (!item || typeof item.id !== 'string' || !item.id.trim()) {
    return fail('VALIDATION', 'Invalid Goods item.');
  }

  const auth = await requireAdmin();
  if (!auth.ok) return auth.error;
  const { supabase, campusId } = auth;

  const { data: existing, error: fetchError } = await supabase
    .from('goods_items')
    .select(
      'id, campus_id, listing_id, cost_cents, serial_number, hold_until, status, intake_date, listing:listings!goods_items_listing_id_fkey(id, title, category, condition, housing_fit, description, price_cents, listing_photos(photo_url, position))',
    )
    .eq('id', item.id)
    .eq('campus_id', campusId)
    .maybeSingle();

  if (fetchError) return fail('UNKNOWN', 'Could not load Goods item.');
  if (!existing) return fail('NOT_FOUND', 'Goods item not found.');

  if (existing.listing_id) {
    const { error: listingUpdateError } = await supabase
      .from('listings')
      .update({
        status: 'sold',
        updated_at: now().toISOString(),
      })
      .eq('id', existing.listing_id)
      .eq('campus_id', campusId);

    if (listingUpdateError) {
      return fail('UNKNOWN', 'Could not mark the marketplace listing as sold.');
    }
  }

  const { data: updatedGoods, error: updateError } = await supabase
    .from('goods_items')
    .update({
      status: 'sold',
      updated_at: now().toISOString(),
    })
    .eq('id', existing.id)
    .eq('campus_id', campusId)
    .select('id, campus_id, listing_id, cost_cents, serial_number, hold_until, status, intake_date')
    .single();

  if (updateError || !updatedGoods) {
    return fail('UNKNOWN', 'Could not mark Goods item as sold.');
  }

  const rawListing = Array.isArray(existing.listing) ? existing.listing[0] : existing.listing;
  return ok(
    mapRowToGoodsItem(
      { ...updatedGoods, status: updatedGoods.status as GoodsStatus },
      rawListing as JoinedListing | null | undefined,
      item,
    ),
  );
}

export async function disposeGoods(item: GoodsItem): Promise<Result<GoodsItem>> {
  if (!item || typeof item.id !== 'string' || !item.id.trim()) {
    return fail('VALIDATION', 'Invalid Goods item.');
  }

  const auth = await requireAdmin();
  if (!auth.ok) return auth.error;
  const { supabase, campusId } = auth;

  const { data: existing, error: fetchError } = await supabase
    .from('goods_items')
    .select(
      'id, campus_id, listing_id, cost_cents, serial_number, hold_until, status, intake_date, listing:listings!goods_items_listing_id_fkey(id, title, category, condition, housing_fit, description, price_cents, listing_photos(photo_url, position))',
    )
    .eq('id', item.id)
    .eq('campus_id', campusId)
    .maybeSingle();

  if (fetchError) return fail('UNKNOWN', 'Could not load Goods item.');
  if (!existing) return fail('NOT_FOUND', 'Goods item not found.');

  if (existing.listing_id) {
    const { error: listingUpdateError } = await supabase
      .from('listings')
      .update({
        status: 'removed',
        updated_at: now().toISOString(),
      })
      .eq('id', existing.listing_id)
      .eq('campus_id', campusId);

    if (listingUpdateError) {
      return fail('UNKNOWN', 'Could not remove the marketplace listing for this disposed item.');
    }
  }

  const { data: updatedGoods, error: updateError } = await supabase
    .from('goods_items')
    .update({
      status: 'disposed',
      updated_at: now().toISOString(),
    })
    .eq('id', existing.id)
    .eq('campus_id', campusId)
    .select('id, campus_id, listing_id, cost_cents, serial_number, hold_until, status, intake_date')
    .single();

  if (updateError || !updatedGoods) {
    return fail('UNKNOWN', 'Could not mark Goods item as disposed.');
  }

  const rawListing = Array.isArray(existing.listing) ? existing.listing[0] : existing.listing;
  return ok(
    mapRowToGoodsItem(
      { ...updatedGoods, status: updatedGoods.status as GoodsStatus },
      rawListing as JoinedListing | null | undefined,
      item,
    ),
  );
}