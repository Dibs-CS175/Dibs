-- Stores offer impressions and choices made by campus users.
create table public.offer_events (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  user_id uuid not null references public.users (id),
  offer_key text not null,
  shown_at timestamptz not null default now(),
  chosen boolean,
  created_at timestamptz not null default now()
);

alter table public.offer_events enable row level security;

create policy "Users can read their offer events"
  on public.offer_events for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can record their offer events"
  on public.offer_events for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.campus_id = offer_events.campus_id
    )
  );

create policy "Users can update their offer choices"
  on public.offer_events for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());