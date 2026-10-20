-- Defines slot kinds and stores campus pickup and packing capacity windows.
create type public.slot_kind as enum ('packing', 'pickup');

create table public.slots (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  kind public.slot_kind not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity integer not null check (capacity >= 0),
  booked integer not null default 0 check (booked >= 0 and booked <= capacity),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

alter table public.slots enable row level security;

create policy "Users can read campus slots"
  on public.slots for select
  to authenticated
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.campus_id = slots.campus_id
  ));