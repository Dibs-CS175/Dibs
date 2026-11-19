-- Lets a student record a payment for their own Summer Hold booking.
-- Before this, the only insert policy on payments required an order, so the $25 registration payment
-- was rejected by row-level security and never saved. The mock provider logs that and carries on.
-- Idempotent on the live project. Like 20261103000100_reconcile_remote.sql, it alters public.payments,
-- which no migration in this repo creates, so it cannot run on a fresh `supabase db reset` yet.

alter table public.payments
  add column if not exists booking_id uuid references public.summer_hold_bookings (id) on delete set null;

create index if not exists payments_booking_id_idx on public.payments (booking_id);

-- A payment belongs to an order or to a booking, never both. Order payments keep their existing policies.
drop policy if exists "Students can record payments for their bookings" on public.payments;
create policy "Students can record payments for their bookings" on public.payments for insert to authenticated
  with check (
    order_id is null
    and exists (
      select 1 from public.summer_hold_bookings b
      where b.id = payments.booking_id and b.user_id = auth.uid()
    )
  );

drop policy if exists "Students can read payments for their bookings" on public.payments;
create policy "Students can read payments for their bookings" on public.payments for select to authenticated
  using (exists (
    select 1 from public.summer_hold_bookings b
    where b.id = payments.booking_id and b.user_id = auth.uid()
  ));
