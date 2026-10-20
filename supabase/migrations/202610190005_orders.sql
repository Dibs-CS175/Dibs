-- Defines order states and stores buyer/seller transactions and quote snapshots.
create type public.order_status as enum (
  'pending_payment', 'held', 'released', 'cancelled', 'refunded'
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  listing_id uuid not null references public.listings (id),
  buyer_id uuid not null references public.users (id),
  seller_id uuid not null references public.users (id),
  status public.order_status not null default 'pending_payment',
  quote jsonb not null,
  payout_quote jsonb not null,
  handoff_code_hash text,
  meetup_spot_id uuid references public.meetup_spots (id),
  meetup_time timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (buyer_id <> seller_id)
);

alter table public.orders enable row level security;

create policy "Order participants can read orders"
  on public.orders for select
  to authenticated
  using (auth.uid() in (buyer_id, seller_id));

create policy "Buyers can create orders"
  on public.orders for insert
  to authenticated
  with check (
    buyer_id = auth.uid()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.campus_id = orders.campus_id
    )
  );

create policy "Order participants can update orders"
  on public.orders for update
  to authenticated
  using (auth.uid() in (buyer_id, seller_id))
  with check (auth.uid() in (buyer_id, seller_id));