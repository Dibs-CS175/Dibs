-- Stores campus-approved meetup locations for orders and message proposals.
create table public.meetup_spots (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

alter table public.meetup_spots enable row level security;

create policy "Users can read campus meetup spots"
  on public.meetup_spots for select
  to authenticated
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.campus_id = meetup_spots.campus_id
  ));