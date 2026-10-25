-- Stores conversation threads linked to a listing and campus.
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  listing_id uuid not null references public.listings (id),
  created_by uuid not null references public.users (id),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.conversations enable row level security;

create policy "Campus users can create conversations"
  on public.conversations for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.campus_id = conversations.campus_id
    )
  );