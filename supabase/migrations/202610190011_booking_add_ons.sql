-- Stores the selected add-on keys for each Summer Hold booking.
create table public.booking_add_ons (
  campus_id text not null,
  booking_id uuid not null references public.summer_hold_bookings (id) on delete cascade,
  add_on_key text not null,
  primary key (booking_id, add_on_key)
);

alter table public.booking_add_ons enable row level security;

create policy "Users can read their booking add-ons"
  on public.booking_add_ons for select
  to authenticated
  using (exists (
    select 1 from public.summer_hold_bookings b
    where b.id = booking_id and b.user_id = auth.uid()
  ));

create policy "Users can manage add-ons on their draft bookings"
  on public.booking_add_ons for all
  to authenticated
  using (exists (
    select 1 from public.summer_hold_bookings b
    where b.id = booking_id and b.user_id = auth.uid() and b.status = 'draft'
  ))
  with check (exists (
    select 1 from public.summer_hold_bookings b
    where b.id = booking_id and b.user_id = auth.uid()
      and b.campus_id = campus_id and b.status = 'draft'
  ));