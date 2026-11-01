-- Creates the campus directory used to map student email domains to campus IDs.
create extension if not exists "citext";
create table if not exists public.campuses(
id text not null primary key,
name text not null,
email_domain text not null,
timezone text not null,
created_at timestamptz not null default now()
);

alter table public.campuses enable row level security;

create policy "Anyone can read list of campuses"
  on public.campuses for select
  using (true);