-- Holds a Full Service packing appointment for a draft Summer Hold booking.
-- Before this, createBooking read the slot, inserted the booking, then updated slots.booked in separate
-- calls. Signed-in users hold SELECT only on slots, so that update changed nothing, and two students
-- could both pass the capacity check for the last place.
-- Idempotent: safe on the live project and on a fresh `supabase db reset`.

-- The capacity check and the increment are one UPDATE, so the row lock makes them atomic: a second
-- caller waits, then sees the new count. When the slot is full the draft is removed in the same
-- transaction (its add-ons cascade), so a booking never points at an appointment it does not hold.
-- Security definer because students cannot write to slots; the function checks auth.uid() itself.
create or replace function public.reserve_packing_slot(p_booking_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_booking record;
  v_slot_id uuid;
begin
  if v_uid is null then
    return public.dibs_fail('NOT_SIGNED_IN', 'Sign in to book a packing appointment.');
  end if;

  select b.id, b.campus_id, b.status, b.packing_slot_id
    into v_booking
    from public.summer_hold_bookings b
   where b.id = p_booking_id
     and b.user_id = v_uid
     for update;

  if not found then
    return public.dibs_fail('NOT_FOUND', 'Booking not found.');
  end if;
  if v_booking.status <> 'draft' then
    return public.dibs_fail('CONFLICT', 'This booking can no longer be changed.');
  end if;
  if v_booking.packing_slot_id is null then
    return public.dibs_fail('VALIDATION', 'This booking has no packing appointment.');
  end if;

  update public.slots s
     set booked = s.booked + 1,
         updated_at = now()
   where s.id = v_booking.packing_slot_id
     and s.campus_id = v_booking.campus_id
     and s.kind = 'packing'
     and s.booked < s.capacity
  returning s.id into v_slot_id;

  if v_slot_id is null then
    delete from public.summer_hold_bookings where id = p_booking_id;
    return public.dibs_fail('SLOT_FULL', 'This packing slot is full.');
  end if;

  return jsonb_build_object('ok', true, 'data', jsonb_build_object('slot_id', v_slot_id));
end;
$$;

revoke all on function public.reserve_packing_slot(uuid) from public, anon;
grant execute on function public.reserve_packing_slot(uuid) to authenticated;
