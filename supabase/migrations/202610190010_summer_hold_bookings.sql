-- Defines booking states and stores student Summer Hold booking details.
create type public.booking_status as enum ('draft', 'registered', 'balance_paid', 'cancelled');

create table public.summer_hold_bookings (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  user_id uuid not null references public.users (id),
  status public.booking_status not null default 'draft',
  housing_type public.user_housing_type not null,
  address text not null,
  standard_count integer not null default 0 check (standard_count >= 0),
  large_count integer not null default 0 check (large_count >= 0),
  registration_tier_key text not null,
  full_service boolean not null default false,
  packing_slot_id uuid references public.slots (id),
  referral_code text,
  parent_pay_token text unique,
  quote jsonb not null,
  registered_at timestamptz,
  free_cancel_until timestamptz,
  balance_due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.summer_hold_bookings enable row level security;

create policy "Users can read their bookings"
  on public.summer_hold_bookings for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can create their bookings"
  on public.summer_hold_bookings for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.campus_id = summer_hold_bookings.campus_id
    )
  );

create policy "Users can update their draft bookings"
  on public.summer_hold_bookings for update
  to authenticated
  using (user_id = auth.uid() and status = 'draft')
  with check (user_id = auth.uid());