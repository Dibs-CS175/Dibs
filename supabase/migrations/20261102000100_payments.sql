-- Creates public.payments, which was made by hand on the hosted project and never had a migration.
-- 20261103000100_reconcile_remote.sql and later migrations alter this table, so without this file
-- a fresh `supabase db reset` fails at reconcile_remote.
-- Idempotent: a no-op on the live project, where the table already exists.
-- Shape is the table before reconcile_remote: that migration adds order_id, updated_at, campus_id,
-- row-level security, policies and grants.
-- Columns, nullability and defaults match the live table (checked 2026-11-18). id is text because the
-- mock provider writes ids like 'mock_pay_x1y2z3'.

create table if not exists public.payments (
  id text primary key,
  amount_cents integer not null,
  currency text not null default 'usd',
  source_token text not null,
  status text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);
