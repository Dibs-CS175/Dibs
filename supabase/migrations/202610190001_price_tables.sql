-- Stores per-campus pricing and nested pricing rules as JSONB.
create table public.price_tables (
campus_id text not null,
starts_at timestamptz not null,
ends_at timestamptz not null,
primary key (campus_id, starts_at),
  item_standard_cents integer not null check (item_standard_cents >= 0),
  item_large_cents integer not null check (item_large_cents >= 0),
  standard_box_rule jsonb not null,
  registration_tiers jsonb not null default '[]'::jsonb,
  cancel_window_days integer not null check (cancel_window_days >= 0),
  balance_due_at timestamptz,
  full_service jsonb not null,
  add_ons jsonb not null default '[]'::jsonb,
  fees jsonb not null,
  coverage_per_item_cents integer not null check (coverage_per_item_cents >= 0),
  marketplace jsonb not null,
  sales_tax_bps integer not null check (sales_tax_bps >= 0),
  pickup_window jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.price_tables enable row level security;

create policy "Anyone can read campus pricing"
  on public.price_tables for select
  to anon, authenticated
  using (true);