'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/actions/summerHold.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { now } from '@/lib/clock';
import rawTables from '@/lib/fixtures/priceTable.json';
import { notImplemented } from '@/lib/live/not-implemented';
import { getSummerHoldQuote } from '@/lib/live/queries/pricing';
import { payments } from '@/lib/payments';
import { currentTier, type PriceRow } from '@/lib/pricing';
import { fail, ok, type Result } from '@/lib/result';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { AddOnKey, BookingDraftInput, MyBooking, ParentPayView, SummerHoldBooking } from '@/lib/types';

const tables = rawTables as unknown as PriceRow[];

function getCampusPriceRow(campusId: string, asOf: Date): PriceRow | null {
  const t = asOf.getTime();
  const rows = tables
    .filter((r) => r.campusId === campusId)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  return (
    rows.find((r) => Date.parse(r.startsAt) <= t && t <= Date.parse(r.endsAt)) ??
    rows.find((r) => Date.parse(r.startsAt) > t) ??
    rows.at(-1) ??
    null
  );
}

// Maps a summer_hold_bookings row to the app type. Add-ons live in their own table, so they are passed in.
function toBooking(r: any, addOnKeys: AddOnKey[]): SummerHoldBooking {
  return {
    id: r.id,
    campusId: r.campus_id,
    userId: r.user_id,
    status: r.status,
    housingType: r.housing_type,
    address: r.address,
    standardCount: r.standard_count,
    largeCount: r.large_count,
    registrationTierKey: r.registration_tier_key,
    fullService: r.full_service,
    packingSlotId: r.packing_slot_id ?? undefined,
    addOnKeys,
    referralCode: r.referral_code ?? undefined,
    parentPayToken: r.parent_pay_token ?? undefined,
    quote: r.quote,
    registeredAt: r.registered_at ?? undefined,
    freeCancelUntil: r.free_cancel_until ?? null,
    balanceDueAt: r.balance_due_at,
  };
}

/**
 * Saves the choices as a draft booking and holds the packing appointment if Full Service is on.
 * Errors: VALIDATION, SLOT_FULL, DEADLINE_PASSED.
 */
export async function createBooking(input: BookingDraftInput): Promise<Result<SummerHoldBooking>> {
const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return fail('NOT_SIGNED_IN', 'Sign in to create a booking.');
  }

  if (!input.address || input.address.trim() === '') {
    return fail('VALIDATION', 'Address is required.');
  }

  if (!input.housingType) {
    return fail('VALIDATION', 'Housing type is required.');
  }

  if (input.standardCount < 0 || input.largeCount < 0) {
    return fail('VALIDATION', 'Item counts must be whole numbers, 0 or more.');
  }

  if (input.standardCount + input.largeCount === 0) {
    return fail('VALIDATION', 'Add at least one item.');
  }

  const asOf = now();
  const row = getCampusPriceRow(input.campusId, asOf);
  if (!row) {
    return fail('NOT_FOUND', 'Prices not found for this campus.');
  }

  const tier = currentTier(row, asOf);
  if (!tier) {
    return fail('DEADLINE_PASSED', 'Summer Hold registration has closed.');
  }

  const quoteResult = await getSummerHoldQuote({
    campusId: input.campusId,
    housingType: input.housingType,
    standardCount: input.standardCount,
    largeCount: input.largeCount,
    fullService: input.fullService,
    addOnKeys: input.addOnKeys,
    referralCode: input.referralCode,
  });

  if (!quoteResult.ok) {
    return quoteResult;
  }

  if (input.fullService && input.packingSlotId) {
    const { data: slot, error: slotError } = await supabase
      .from('slots')
      .select('id, capacity, booked, campus_id, kind')
      .eq('id', input.packingSlotId)
      .eq('campus_id', input.campusId)
      .eq('kind', 'packing')
      .maybeSingle();

    if (slotError || !slot) {
      return fail('NOT_FOUND', 'Packing slot not found.');
    }

    if (slot.booked >= slot.capacity) {
      return fail('SLOT_FULL', 'This packing slot is full.');
    }
  }

  const { data: bookingRow, error: insertError } = await supabase
    .from('summer_hold_bookings')
    .insert({
      campus_id: input.campusId,
      user_id: authData.user.id,
      status: 'draft',
      housing_type: input.housingType,
      address: input.address.trim(),
      standard_count: input.standardCount,
      large_count: input.largeCount,
      registration_tier_key: tier.key,
      full_service: input.fullService,
      packing_slot_id: input.packingSlotId || null,
      referral_code: input.referralCode || null,
      quote: quoteResult.data,
      balance_due_at: row.balanceDueDate,
    })
    .select()
    .single();

  if (insertError || !bookingRow) {
    return fail('UNKNOWN', 'Could not create booking.');
  }

  if (input.addOnKeys && input.addOnKeys.length > 0) {
    const addOnRows = input.addOnKeys.map((key) => ({
      campus_id: input.campusId,
      booking_id: bookingRow.id,
      add_on_key: key,
    }));

    const { error: addOnError } = await supabase.from('booking_add_ons').insert(addOnRows);
    if (addOnError) {
      return fail('UNKNOWN', 'Could not save booking add-ons.');
    }
  }

  if (input.fullService && input.packingSlotId) {
    const { data: currentSlot } = await supabase
      .from('slots')
      .select('booked')
      .eq('id', input.packingSlotId)
      .single();

    if (currentSlot) {
      await supabase
        .from('slots')
        .update({ booked: currentSlot.booked + 1 })
        .eq('id', input.packingSlotId);
    }
  }

  return ok({
    id: bookingRow.id,
    campusId: bookingRow.campus_id,
    userId: bookingRow.user_id,
    status: bookingRow.status,
    housingType: bookingRow.housing_type,
    address: bookingRow.address,
    standardCount: bookingRow.standard_count,
    largeCount: bookingRow.large_count,
    registrationTierKey: bookingRow.registration_tier_key,
    fullService: bookingRow.full_service,
    packingSlotId: bookingRow.packing_slot_id ?? undefined,
    addOnKeys: input.addOnKeys,
    referralCode: bookingRow.referral_code ?? undefined,
    parentPayToken: bookingRow.parent_pay_token ?? undefined,
    quote: bookingRow.quote,
    registeredAt: bookingRow.registered_at ?? undefined,
    freeCancelUntil: bookingRow.free_cancel_until ?? null,
    balanceDueAt: bookingRow.balance_due_at,
  });
}

/** Pays the registration; Dibs Protect holds it. Errors: PAYMENT_FAILED, DEADLINE_PASSED, REFERRAL_INVALID. */
export async function payRegistration(
  bookingId: string,
  referralCode: string,
): Promise<Result<SummerHoldBooking>> {
  // Referral credit is cut from the class demo (Nov 9), so the code is accepted and not applied.
  void referralCode;

  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return fail('NOT_SIGNED_IN', 'Sign in to pay your registration.');
  }

  const { data: draft, error: readError } = await supabase
    .from('summer_hold_bookings')
    .select('*')
    .eq('id', bookingId)
    .eq('user_id', authData.user.id)
    .maybeSingle();

  if (readError) {
    return fail('UNKNOWN', 'Could not load your booking.');
  }
  if (!draft) {
    return fail('NOT_FOUND', 'Booking not found.');
  }

  const { data: addOnsData } = await supabase
    .from('booking_add_ons')
    .select('add_on_key')
    .eq('booking_id', bookingId);
  const addOnKeys = (addOnsData ?? []).map((r) => r.add_on_key as AddOnKey);

  // A second tap on Pay returns the paid booking instead of charging again.
  if (draft.status === 'registered') {
    return ok(toBooking(draft, addOnKeys));
  }
  if (draft.status !== 'draft') {
    return fail('CONFLICT', 'This booking can no longer be paid.');
  }

  // The student pays the tier they booked. If that tier has ended, they rebook at the current price.
  const asOf = now();
  const row = getCampusPriceRow(draft.campus_id, asOf);
  const tier = row ? currentTier(row, asOf) : null;
  if (!row || !tier || tier.key !== draft.registration_tier_key) {
    return fail('DEADLINE_PASSED', 'That registration price has ended. Start a new booking.');
  }

  const charge = await payments.charge({
    amountCents: tier.cents,
    sourceToken: 'mock_card',
    metadata: { kind: 'summer_hold_registration', bookingId },
  });
  if (!charge.ok) {
    return fail('PAYMENT_FAILED', 'Your payment did not go through. Try again.');
  }

  const freeCancelUntil = new Date(asOf.getTime() + row.cancelWindowDays * 24 * 60 * 60 * 1000);

  // The status filter makes this a no-op if another request already registered the booking.
  const { data: paidRow, error: updateError } = await supabase
    .from('summer_hold_bookings')
    .update({
      status: 'registered',
      registered_at: asOf.toISOString(),
      free_cancel_until: freeCancelUntil.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .eq('user_id', authData.user.id)
    .eq('status', 'draft')
    .select()
    .maybeSingle();

  if (updateError || !paidRow) {
    return fail('UNKNOWN', 'Payment recorded but the booking did not update. Reload and check your booking.');
  }

  return ok(toBooking(paidRow, addOnKeys));
}

/** Creates a link a parent can open without signing in. */
export async function createParentPayLink(
  bookingId: string,
): Promise<Result<{ token: string; path: string }>> {
  // STUB(summerHold): replace with real implementation
  return notImplemented('createParentPayLink', 'lib/live/actions/summerHold.ts');
}

/** Errors: CONFLICT (already cancelled). */
export async function cancelBooking(bookingId: string): Promise<Result<MyBooking>> {
  // STUB(summerHold): replace with real implementation
  return notImplemented('cancelBooking', 'lib/live/actions/summerHold.ts');
}

/** Errors: PAYMENT_FAILED, DEADLINE_PASSED. */
export async function payBalance(bookingId: string): Promise<Result<MyBooking>> {
  // STUB(summerHold): replace with real implementation
  return notImplemented('payBalance', 'lib/live/actions/summerHold.ts');
}

/** Public: a parent pays through their link. Errors: PAYMENT_FAILED, NOT_FOUND. */
export async function payAsParent(view: ParentPayView): Promise<Result<ParentPayView>> {
  // STUB(summerHold): replace with real implementation
  return notImplemented('payAsParent', 'lib/live/actions/summerHold.ts');
}
