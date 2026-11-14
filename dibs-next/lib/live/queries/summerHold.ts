'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/queries/summerHold.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.



import { notImplemented } from '@/lib/live/not-implemented';
import { fail, ok, type Result } from '@/lib/result';
import { createSupabaseServerClient } from '@/lib/supabase/server'; // necessary to access database
import type { AddOnKey, MyBooking, ParentPayView, SlotView, SummerHoldBooking } from '@/lib/types';

/** The signed-in student's booking for this summer, or null. Flags come from the backend. */
export async function getMyBooking(): Promise<Result<MyBooking | null>> {
  const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return fail('NOT_SIGNED_IN', 'Sign in to view your booking.');
    }

  const { data: bookingRow, error: bookingError } = await supabase
    .from('summer_hold_bookings')
    .select('*')
    .eq('user_id', authData.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (bookingError) {
    return fail('UNKNOWN', 'Could not retrieve your booking.');
  }

  if (!bookingRow) {
    return ok(null);
  }

  const { data: addOnsData } = await supabase
    .from('booking_add_ons')
    .select('add_on_key')
    .eq('booking_id', bookingRow.id);

  const addOnKeys = (addOnsData ?? []).map((row) => row.add_on_key as AddOnKey);

  let packingSlot: SlotView | null = null;
  if (bookingRow.packing_slot_id) {
    const { data: slotRow } = await supabase
      .from('slots')
      .select('id, campus_id, kind, starts_at, ends_at, capacity, booked')
      .eq('id', bookingRow.packing_slot_id)
      .maybeSingle();

    if (slotRow) {
      packingSlot = {
        id: slotRow.id,
        campusId: slotRow.campus_id,
        kind: slotRow.kind,
        startsAt: slotRow.starts_at,
        endsAt: slotRow.ends_at,
        capacity: slotRow.capacity,
        booked: slotRow.booked,
        isFull: slotRow.booked >= slotRow.capacity,
      };
    }
  }

  const booking: SummerHoldBooking = {
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
    addOnKeys,
    referralCode: bookingRow.referral_code ?? undefined,
    parentPayToken: bookingRow.parent_pay_token ?? undefined,
    quote: bookingRow.quote,
    registeredAt: bookingRow.registered_at ?? undefined,
    freeCancelUntil: bookingRow.free_cancel_until ?? null,
    balanceDueAt: bookingRow.balance_due_at,
  };

  return ok({
    booking,
    packingSlot,
    canCancel: false,
    canPayBalance: false,
  });
}

// export type SlotKind = 'packing' | 'pickup';
/** Full Service packing appointments for a campus. `isFull` comes from the backend. */
export async function getPackingSlots(campusId: string): Promise<Result<SlotView[]>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('slots')
    .select('*')
    .eq('campus_id', campusId)
    .eq('kind', 'packing');

  if (error) {
    return fail('UNKNOWN', 'Could not retrieve packing slots.');
  }

  return ok(
    data.map((row) => ({
      id: row.id,
      campusId: row.campus_id,
      kind: row.kind,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      capacity: row.capacity,
      booked: row.booked,
      isFull: row.booked >= row.capacity,
    })),
  );
}

/** Move-out pickup windows for a campus. */
export async function getPickupSlots(campusId: string): Promise<Result<SlotView[]>> {
    const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('slots')
    .select('*')
    .eq('campus_id', campusId)
    .eq('kind', 'pickup');

  if (error) {
    return fail('UNKNOWN', 'Could not retrieve pickup slots.');
  }

  return ok(
    data.map((row) => ({
      id: row.id,
      campusId: row.campus_id,
      kind: row.kind,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      capacity: row.capacity,
      booked: row.booked,
      isFull: row.booked >= row.capacity,
    })),
  );
}

/** Public: what a parent sees on the pay link. No sign-in. Errors: NOT_FOUND for an unknown token. */
export async function getParentPayView(token: string): Promise<Result<ParentPayView>> {
  // STUB(summerHold): replace with real implementation
  return notImplemented('getParentPayView', 'lib/live/queries/summerHold.ts');
}
