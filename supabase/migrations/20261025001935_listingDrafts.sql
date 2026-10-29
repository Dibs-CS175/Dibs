-- Stores in-progress student listings separately from published listings.
create table public.listing_drafts (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  seller_id uuid not null references public.users (id) on delete cascade,
  photos text[] not null default '{}',
  title text not null default '',
  category public.listing_category,
  condition public.listing_condition,
  housing_fit public.listing_housing_fit,
  description text not null default '',
  price_cents integer check (price_cents is null or price_cents >= 0),
  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listing_drafts_seller_saved_at_idx
  on public.listing_drafts (seller_id, saved_at desc);

alter table public.listing_drafts enable row level security;

create policy "Users can read their listing drafts"
  on public.listing_drafts for select
  to authenticated
  using (seller_id = auth.uid());

create policy "Users can create their listing drafts"
  on public.listing_drafts for insert
  to authenticated
  with check (
    seller_id = auth.uid()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.campus_id = listing_drafts.campus_id
    )
  );

create policy "Users can update their listing drafts"
  on public.listing_drafts for update
  to authenticated
  using (seller_id = auth.uid())
  with check (
    seller_id = auth.uid()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.campus_id = listing_drafts.campus_id
    )
  );

create policy "Users can delete their listing drafts"
  on public.listing_drafts for delete
  to authenticated
  using (seller_id = auth.uid());
