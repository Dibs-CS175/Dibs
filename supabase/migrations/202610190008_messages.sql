-- Defines message kinds and stores conversation messages and meetup proposals.
create type public.message_kind as enum ('text', 'meetup_proposal');

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.users (id),
  body text not null,
  kind public.message_kind not null default 'text',
  meetup_spot_id uuid references public.meetup_spots (id),
  meetup_time timestamptz,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table public.messages enable row level security;

create policy "Conversation participants can read messages"
  on public.messages for select
  to authenticated
  using (exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()
  ));

create policy "Participants can send messages as themselves"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()
    )
  );

create policy "Recipients can mark messages read"
  on public.messages for update
  to authenticated
  using (exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()
      and sender_id <> auth.uid()
  ))
  with check (exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()
      and sender_id <> auth.uid()
  ));