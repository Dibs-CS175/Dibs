-- Messaging functions: open a conversation, send a message, propose and accept a meetup, read the inbox
-- and a thread. The tables alone cannot do this from TypeScript: a new conversation is unreadable until its
-- participant rows exist, there is nowhere to store an accepted meetup, and RLS stops a sender from bumping
-- the other person's unread count. Each function is security definer, checks auth.uid() itself, and returns
-- jsonb shaped like claim_listing: { ok: true, data } or { ok: false, error_code, message }.
-- Idempotent: safe on the live project and on a fresh `supabase db reset`.

-- 1. Schema additions ------------------------------------------------------------------------------------
alter table public.messages add column if not exists accepted_at timestamptz;

create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at, id);
create index if not exists messages_sender_created_idx
  on public.messages (sender_id, created_at);
create index if not exists conversation_participants_user_idx
  on public.conversation_participants (user_id);

-- One conversation per buyer per listing. Skipped if the live project already has duplicates.
do $$
begin
  if not exists (
    select 1 from public.conversations group by listing_id, created_by having count(*) > 1
  ) then
    create unique index if not exists conversations_listing_buyer_key
      on public.conversations (listing_id, created_by);
  end if;
end $$;

-- 2. Shared helpers (internal, not callable from the Data API) -------------------------------------------
create or replace function public.dibs_fail(p_code text, p_message text)
returns jsonb
language sql
immutable
set search_path = public, pg_temp
as $$
  select jsonb_build_object('ok', false, 'error_code', p_code, 'message', p_message);
$$;

create or replace function public.dibs_message_json(m public.messages)
returns jsonb
language sql
stable
set search_path = public, pg_temp
as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'id', m.id,
    'conversationId', m.conversation_id,
    'senderId', m.sender_id,
    'body', m.body,
    'kind', m.kind,
    'meetupSpotId', m.meetup_spot_id,
    'meetupTime', m.meetup_time,
    'createdAt', m.created_at,
    'readAt', m.read_at
  ));
$$;

create or replace function public.dibs_conversation_json(p_conversation_id uuid, p_viewer uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'id', c.id,
    'listingId', c.listing_id,
    'participantIds', (
      select coalesce(jsonb_agg(cp.user_id order by cp.joined_at, cp.user_id), '[]'::jsonb)
      from public.conversation_participants cp where cp.conversation_id = c.id
    ),
    'lastMessageAt', c.last_message_at,
    'unreadCount', coalesce((
      select cp.unread_count from public.conversation_participants cp
      where cp.conversation_id = c.id and cp.user_id = p_viewer
    ), 0)
  )
  from public.conversations c
  where c.id = p_conversation_id;
$$;

create or replace function public.dibs_listing_json(p_listing_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'id', l.id,
    'title', l.title,
    'photos', (
      select coalesce(jsonb_agg(p.photo_url order by p.position), '[]'::jsonb)
      from public.listing_photos p where p.listing_id = l.id
    ),
    'priceCents', l.price_cents,
    'status', l.status
  )
  from public.listings l
  where l.id = p_listing_id;
$$;

create or replace function public.dibs_other_user_json(p_conversation_id uuid, p_viewer uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  -- Only the public name fields; never email, role or campus.
  select coalesce(
    (select jsonb_build_object('id', u.id, 'firstName', u.first_name, 'lastInitial', u.last_initial)
     from public.conversation_participants cp
     join public.users u on u.id = cp.user_id
     where cp.conversation_id = p_conversation_id and cp.user_id <> p_viewer
     order by cp.joined_at
     limit 1),
    jsonb_build_object('id', '', 'firstName', 'Former member', 'lastInitial', '')
  );
$$;

revoke all on function public.dibs_fail(text, text) from public, anon, authenticated;
revoke all on function public.dibs_message_json(public.messages) from public, anon, authenticated;
revoke all on function public.dibs_conversation_json(uuid, uuid) from public, anon, authenticated;
revoke all on function public.dibs_listing_json(uuid) from public, anon, authenticated;
revoke all on function public.dibs_other_user_json(uuid, uuid) from public, anon, authenticated;

-- 3. start_conversation: opens (or reuses) the buyer's conversation about a listing -----------------------
create or replace function public.start_conversation(p_listing_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_campus text;
  v_listing public.listings%rowtype;
  v_conversation_id uuid;
begin
  if v_uid is null then
    return public.dibs_fail('NOT_SIGNED_IN', 'Sign in to message the seller.');
  end if;
  select campus_id into v_campus from public.users where id = v_uid;
  if v_campus is null then
    return public.dibs_fail('FORBIDDEN', 'This account is not linked to a campus.');
  end if;

  select * into v_listing from public.listings where id = p_listing_id and campus_id = v_campus;
  if not found or v_listing.status = 'removed' then
    return public.dibs_fail('NOT_FOUND', 'Listing not found.');
  end if;
  if v_listing.seller_id is null then
    return public.dibs_fail('VALIDATION', 'Dibs Goods items do not have a seller to message.');
  end if;
  if v_listing.seller_id = v_uid then
    return public.dibs_fail('VALIDATION', 'This is your own listing.');
  end if;

  -- Reuse the viewer's existing conversation about this listing, as buyer or as a participant.
  select c.id into v_conversation_id
  from public.conversations c
  join public.conversation_participants cp on cp.conversation_id = c.id and cp.user_id = v_uid
  where c.listing_id = p_listing_id
  order by c.created_at
  limit 1;

  if v_conversation_id is null then
    if v_listing.status = 'sold' then
      return public.dibs_fail('CONFLICT', 'This item already sold.');
    end if;
    insert into public.conversations (campus_id, listing_id, created_by)
    values (v_campus, p_listing_id, v_uid)
    on conflict do nothing
    returning id into v_conversation_id;
    if v_conversation_id is null then
      -- A double tap raced us; use the row the other call made.
      select id into v_conversation_id from public.conversations
      where listing_id = p_listing_id and created_by = v_uid;
    end if;
    insert into public.conversation_participants (campus_id, conversation_id, user_id)
    values (v_campus, v_conversation_id, v_uid), (v_campus, v_conversation_id, v_listing.seller_id)
    on conflict do nothing;
  end if;

  return jsonb_build_object('ok', true, 'data', public.dibs_conversation_json(v_conversation_id, v_uid));
end;
$$;

-- 4. send_message and propose_meetup share one insert path ------------------------------------------------
create or replace function public.dibs_insert_message(
  p_conversation_id uuid,
  p_body text,
  p_kind public.message_kind,
  p_spot_id uuid,
  p_time timestamptz
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_conversation public.conversations%rowtype;
  v_listing_status public.listing_status;
  v_message public.messages%rowtype;
begin
  if v_uid is null then
    return public.dibs_fail('NOT_SIGNED_IN', 'Sign in to send messages.');
  end if;

  select c.* into v_conversation
  from public.conversations c
  join public.conversation_participants cp on cp.conversation_id = c.id and cp.user_id = v_uid
  where c.id = p_conversation_id;
  if not found then
    return public.dibs_fail('NOT_FOUND', 'This conversation is gone.');
  end if;

  select status into v_listing_status from public.listings where id = v_conversation.listing_id;
  if v_listing_status = 'sold' then
    return public.dibs_fail('CONFLICT', 'This item sold, so the conversation is closed.');
  end if;

  if (select count(*) from public.messages
      where sender_id = v_uid and created_at > now() - interval '1 minute') >= 20 then
    return public.dibs_fail('RATE_LIMITED', 'You are sending messages too fast. Wait a minute and try again.');
  end if;

  insert into public.messages (campus_id, conversation_id, sender_id, body, kind, meetup_spot_id, meetup_time)
  values (v_conversation.campus_id, p_conversation_id, v_uid, p_body, p_kind, p_spot_id, p_time)
  returning * into v_message;

  update public.conversations
  set last_message_at = v_message.created_at, updated_at = now()
  where id = p_conversation_id;

  update public.conversation_participants
  set unread_count = unread_count + 1
  where conversation_id = p_conversation_id and user_id <> v_uid;

  return jsonb_build_object('ok', true, 'data', public.dibs_message_json(v_message));
end;
$$;
revoke all on function public.dibs_insert_message(uuid, text, public.message_kind, uuid, timestamptz)
  from public, anon, authenticated;

create or replace function public.send_message(p_conversation_id uuid, p_body text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_body text := btrim(coalesce(p_body, ''));
begin
  if v_body = '' then
    return public.dibs_fail('VALIDATION', 'Write a message first.');
  end if;
  if char_length(v_body) > 2000 then
    return public.dibs_fail('VALIDATION', 'Messages can be up to 2,000 characters.');
  end if;
  return public.dibs_insert_message(p_conversation_id, v_body, 'text', null, null);
end;
$$;

create or replace function public.propose_meetup(p_conversation_id uuid, p_spot_id uuid, p_time timestamptz)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
begin
  if p_time is null or p_time <= now() then
    return public.dibs_fail('VALIDATION', 'Pick a meetup time in the future.');
  end if;
  if p_time > now() + interval '90 days' then
    return public.dibs_fail('VALIDATION', 'Pick a meetup time within the next 90 days.');
  end if;
  -- The spot must be on the conversation's campus list.
  if not exists (
    select 1 from public.meetup_spots s
    join public.conversations c on c.campus_id = s.campus_id
    where s.id = p_spot_id and c.id = p_conversation_id
  ) then
    return public.dibs_fail('VALIDATION', 'Pick a meetup spot from the campus list.');
  end if;
  return public.dibs_insert_message(p_conversation_id, 'Suggested a meetup', 'meetup_proposal', p_spot_id, p_time);
end;
$$;

-- 5. accept_meetup -----------------------------------------------------------------------------------------
create or replace function public.accept_meetup(p_message_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_message public.messages%rowtype;
begin
  if v_uid is null then
    return public.dibs_fail('NOT_SIGNED_IN', 'Sign in to accept a meetup.');
  end if;

  select m.* into v_message
  from public.messages m
  join public.conversation_participants cp on cp.conversation_id = m.conversation_id and cp.user_id = v_uid
  where m.id = p_message_id
  for update of m;
  if not found or v_message.kind <> 'meetup_proposal' then
    return public.dibs_fail('NOT_FOUND', 'That meetup suggestion is gone.');
  end if;
  if v_message.sender_id = v_uid then
    return public.dibs_fail('VALIDATION', 'The other person has to accept your suggestion.');
  end if;
  if v_message.accepted_at is not null then
    return jsonb_build_object('ok', true, 'data', jsonb_build_object('messageId', v_message.id));
  end if;
  if exists (
    select 1 from public.messages n
    where n.conversation_id = v_message.conversation_id
      and n.kind = 'meetup_proposal'
      and (n.created_at, n.id) > (v_message.created_at, v_message.id)
  ) then
    return public.dibs_fail('CONFLICT', 'A newer suggestion replaced this one.');
  end if;

  update public.messages set accepted_at = now() where id = v_message.id;
  return jsonb_build_object('ok', true, 'data', jsonb_build_object('messageId', v_message.id));
end;
$$;

-- 6. get_inbox -----------------------------------------------------------------------------------------------
create or replace function public.get_inbox()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return public.dibs_fail('NOT_SIGNED_IN', 'Sign in to see your messages.');
  end if;
  return jsonb_build_object('ok', true, 'data', coalesce((
    select jsonb_agg(row_json order by last_at desc, conv_id)
    from (
      select
        c.id as conv_id,
        c.last_message_at as last_at,
        jsonb_build_object(
          'conversation', public.dibs_conversation_json(c.id, v_uid),
          'listing', public.dibs_listing_json(c.listing_id),
          'otherUser', public.dibs_other_user_json(c.id, v_uid),
          'lastMessagePreview', coalesce((
            select case when m.kind = 'meetup_proposal' then 'Suggested a meetup' else m.body end
            from public.messages m
            where m.conversation_id = c.id
            order by m.created_at desc, m.id desc
            limit 1
          ), '')
        ) as row_json
      from public.conversations c
      join public.conversation_participants cp on cp.conversation_id = c.id and cp.user_id = v_uid
    ) rows
  ), '[]'::jsonb));
end;
$$;

-- 7. get_thread: returns the thread and marks the viewer's side read ------------------------------------------
create or replace function public.get_thread(p_conversation_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_conversation public.conversations%rowtype;
  v_listing jsonb;
begin
  if v_uid is null then
    return public.dibs_fail('NOT_SIGNED_IN', 'Sign in to see your messages.');
  end if;

  select c.* into v_conversation
  from public.conversations c
  join public.conversation_participants cp on cp.conversation_id = c.id and cp.user_id = v_uid
  where c.id = p_conversation_id;
  if not found then
    -- Same answer whether the thread is missing or belongs to someone else.
    return public.dibs_fail('NOT_FOUND', 'This conversation is gone.');
  end if;

  update public.conversation_participants
  set unread_count = 0
  where conversation_id = p_conversation_id and user_id = v_uid and unread_count <> 0;
  update public.messages
  set read_at = now()
  where conversation_id = p_conversation_id and sender_id <> v_uid and read_at is null;

  v_listing := public.dibs_listing_json(v_conversation.listing_id);

  return jsonb_build_object('ok', true, 'data', jsonb_build_object(
    'conversation', public.dibs_conversation_json(p_conversation_id, v_uid),
    'campusId', v_conversation.campus_id,
    'listing', v_listing,
    'otherUser', public.dibs_other_user_json(p_conversation_id, v_uid),
    'messages', coalesce((
      select jsonb_agg(public.dibs_message_json(m) order by m.created_at, m.id)
      from public.messages m where m.conversation_id = p_conversation_id
    ), '[]'::jsonb),
    'viewerId', v_uid,
    'acceptedProposalIds', coalesce((
      select jsonb_agg(m.id order by m.created_at)
      from public.messages m
      where m.conversation_id = p_conversation_id and m.kind = 'meetup_proposal' and m.accepted_at is not null
    ), '[]'::jsonb),
    'listingSold', coalesce(v_listing ->> 'status' = 'sold', false)
  ));
end;
$$;

-- 8. Who can call what ------------------------------------------------------------------------------------------
revoke all on function public.start_conversation(uuid) from public, anon;
revoke all on function public.send_message(uuid, text) from public, anon;
revoke all on function public.propose_meetup(uuid, uuid, timestamptz) from public, anon;
revoke all on function public.accept_meetup(uuid) from public, anon;
revoke all on function public.get_inbox() from public, anon;
revoke all on function public.get_thread(uuid) from public, anon;
grant execute on function public.start_conversation(uuid) to authenticated;
grant execute on function public.send_message(uuid, text) to authenticated;
grant execute on function public.propose_meetup(uuid, uuid, timestamptz) to authenticated;
grant execute on function public.accept_meetup(uuid) to authenticated;
grant execute on function public.get_inbox() to authenticated;
grant execute on function public.get_thread(uuid) to authenticated;

-- Writes go through the functions above. Direct inserts and updates from the client are no longer needed,
-- and leaving them open would let a client skip the checks (campus spot list, rate limit, sold listing).
revoke insert, update, delete on public.messages from authenticated;
revoke insert, update, delete on public.conversations, public.conversation_participants from authenticated;

