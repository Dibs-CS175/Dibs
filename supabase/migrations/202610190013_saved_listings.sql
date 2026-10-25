-- Joins users to the listings they have saved.
create table public.saved_listings (
  campus_id text not null,
  user_id uuid not null references public.users (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table public.saved_listings enable row level security;

create policy "Users can manage their saved listings"
  on public.saved_listings for all
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.campus_id = saved_listings.campus_id
    )
  );