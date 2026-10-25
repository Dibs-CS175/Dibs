-- Stores ordered listing photos as child rows rather than an array on listings.
create table public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  listing_id uuid not null references public.listings (id) on delete cascade,
  photo_url text not null,
  position integer not null check (position >= 0),
  created_at timestamptz not null default now(),
  unique (listing_id, position)
);

alter table public.listing_photos enable row level security;

create policy "Users can read campus listing photos"
  on public.listing_photos for select
  to authenticated
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.campus_id = listing_photos.campus_id
  ));

create policy "Listing owners can manage photos"
  on public.listing_photos for all
  to authenticated
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id and l.seller_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.listings l
    where l.id = listing_id and l.seller_id = auth.uid() and l.campus_id = campus_id
  ));