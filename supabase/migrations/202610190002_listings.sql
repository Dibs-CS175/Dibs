-- Defines listing-specific enums and stores student and Dibs marketplace listings.
create type public.listing_source as enum ('student', 'goods');
create type public.listing_seller_type as enum ('student', 'dibs');
create type public.listing_condition as enum ('new', 'like_new', 'good', 'fair');
create type public.listing_housing_fit as enum ('dorm', 'apartment', 'not_allowed');
create type public.listing_status as enum ('active', 'claimed', 'sold', 'removed');
create type public.listing_category as enum (
  'dorm_essentials', 'furniture', 'kitchen', 'textbooks',
  'electronics', 'bikes_boards', 'clothing', 'other'
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  seller_id uuid references public.users (id),
  source public.listing_source not null,
  seller_type public.listing_seller_type not null,
  title text not null,
  description text not null default '',
  price_cents integer not null check (price_cents >= 0),
  condition public.listing_condition not null,
  category public.listing_category not null,
  housing_fit public.listing_housing_fit not null,
  status public.listing_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((source = 'goods') = (seller_type = 'dibs')),
  check (seller_type = 'dibs' or seller_id is not null)
);

alter table public.listings enable row level security;

create policy "Users can read campus listings"
  on public.listings for select
  to authenticated
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.campus_id = listings.campus_id
  ));

create policy "Users can create their own listings"
  on public.listings for insert
  to authenticated
  with check (
    seller_type = 'student'
    and seller_id = auth.uid()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.campus_id = listings.campus_id
    )
  );

create policy "Users can update their own listings"
  on public.listings for update
  to authenticated
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid());