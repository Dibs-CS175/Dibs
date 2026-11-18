-- Creates public.payments, which was made by hand on the hosted project and never had a migration.
-- 20261103000100_reconcile_remote.sql and later migrations alter this table, so without this file
-- a fresh `supabase db reset` fails at reconcile_remote.
-- Idempotent: a no-op on the live project, where the table already exists.
-- Shape is the table before reconcile_remote: that migration adds order_id, updated_at, campus_id,
-- row-level security, policies and grants.
-- Types come from what MockPaymentProvider inserts (lib/payments.ts). id is text because the mock
-- provider writes ids like 'mock_pay_x1y2z3'. Check these against the live table before relying on it.

create table if not exists public.payments (
  id text primary key,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'usd',
  source_token text not null,
  status text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
