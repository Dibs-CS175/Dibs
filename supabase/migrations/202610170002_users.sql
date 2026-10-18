create extension if not exists pgcrypto;

create type public.user_role as enum ('student', 'admin');
create type public.user_housing_type as enum ('hall', 'campus_apartment', 'off_campus', 'commuter');

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  campus_id text not null default 'unknown',
  first_name text not null default '',
  last_initial text not null default '',
  email citext not null unique,
  housing_type public.user_housing_type,
  role public.user_role not null default 'student',
  verified boolean not null default false,
  trades_count integer not null default 0,
  member_since timestamptz not null default now(),
  referral_code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can view their own row"
  on public.users
  for select
  using (auth.uid() = id);

create policy "Users can insert their own row"
  on public.users
  for insert
  with check (auth.uid() = id);

create policy "Users can update their own row"
  on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    id,
    campus_id,
    first_name,
    last_initial,
    email,
    role,
    verified,
    referral_code
  )
  values (
    new.id,
    coalesce(
      (
        select c.id
        from public.campuses c
        where lower(new.email) like '%' || lower(c.email_domain)
        order by length(c.email_domain) desc
        limit 1
      ),
      'unknown'
    ),
    '',
    '',
    new.email,
    'student',
    coalesce(new.email_confirmed_at is not null, false),
    encode(gen_random_bytes(8), 'hex')
  )
  on conflict (id) do update
  set campus_id = excluded.campus_id,
      first_name = coalesce(public.users.first_name, ''),
      last_initial = coalesce(public.users.last_initial, ''),
      email = excluded.email,
      role = coalesce(public.users.role, excluded.role),
      verified = excluded.verified,
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

create or replace function public.update_users_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_updated_at_trigger on public.users;
create trigger users_updated_at_trigger
  before update on public.users
  for each row execute procedure public.update_users_updated_at();
