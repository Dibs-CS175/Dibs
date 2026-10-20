-- Defines inventory states and stores Dibs acquisition and holding details.
create type public.goods_status as enum ('intake', 'holding', 'listed', 'sold', 'disposed');

create table public.goods_items (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  listing_id uuid references public.listings (id) on delete cascade,
  cost_cents integer check (cost_cents is null or cost_cents >= 0),
  serial_number text,
  hold_until timestamptz,
  status public.goods_status not null default 'intake',
  intake_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index goods_items_listing_id_key
  on public.goods_items (listing_id)
  where listing_id is not null;

alter table public.goods_items enable row level security;

create policy "Campus users can read Dibs goods"
  on public.goods_items for select
  to authenticated
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.campus_id = goods_items.campus_id
  ));