-- Defines credit reasons and stores user referral credits in integer cents.
create type public.credit_reason as enum ('referral_given', 'referral_received');

create table public.credit_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  user_id uuid not null references public.users (id),
  cents integer not null check (cents > 0),
  reason public.credit_reason not null,
  created_at timestamptz not null default now()
);

alter table public.credit_ledger_entries enable row level security;

create policy "Users can read their credit ledger"
  on public.credit_ledger_entries for select
  to authenticated
  using (user_id = auth.uid());