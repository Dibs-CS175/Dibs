-- Links users to conversation threads and configures participant-based access.
create table public.conversation_participants (
  campus_id text not null,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  unread_count integer not null default 0 check (unread_count >= 0),
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

alter table public.conversation_participants enable row level security;

create policy "Users can read their conversation memberships"
  on public.conversation_participants for select
  to authenticated
  using (user_id = auth.uid());

create policy "Conversation creator can add participants"
  on public.conversation_participants for insert
  to authenticated
  with check (exists (
    select 1 from public.conversations c
    where c.id = conversation_participants.conversation_id
      and c.created_by = auth.uid()
      and c.campus_id = conversation_participants.campus_id
  ));

create policy "Users can update their own conversation membership"
  on public.conversation_participants for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Conversation participants can read conversations"
  on public.conversations for select
  to authenticated
  using (exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = conversations.id and cp.user_id = auth.uid()
  ));