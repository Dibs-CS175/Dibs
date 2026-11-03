-- Reconciles the hosted Supabase project with the repo (found on 2026-11-03).
-- Idempotent: safe on the live project and on a fresh `supabase db reset`.
-- Covers: missing grants, drafts table, photo bucket, payments table shape, hardened claim_listing,
-- one active order per listing, admin write policies, Realtime for messages, function hardening.
-- Note: the project has "Automatically expose new tables" off, so every new table needs explicit GRANTs.

-- 1. Admin helper (security definer so the users RLS cannot recurse) -------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin');
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 2. Listing drafts (from 20261025001935_listingDrafts.sql) ----------------------------------------
create table if not exists public.listing_drafts (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  seller_id uuid not null references public.users (id) on delete cascade,
  photos text[] not null default '{}',
  title text not null default '',
  category public.listing_category,
  condition public.listing_condition,
  housing_fit public.listing_housing_fit,
  description text not null default '',
  price_cents integer check (price_cents is null or price_cents >= 0),
  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists listing_drafts_seller_saved_at_idx on public.listing_drafts (seller_id, saved_at desc);
alter table public.listing_drafts enable row level security;
drop policy if exists "Users can read their listing drafts" on public.listing_drafts;
create policy "Users can read their listing drafts" on public.listing_drafts for select to authenticated
  using (seller_id = auth.uid());
drop policy if exists "Users can create their listing drafts" on public.listing_drafts;
create policy "Users can create their listing drafts" on public.listing_drafts for insert to authenticated
  with check (seller_id = auth.uid() and exists (
    select 1 from public.users u where u.id = auth.uid() and u.campus_id = listing_drafts.campus_id));
drop policy if exists "Users can update their listing drafts" on public.listing_drafts;
create policy "Users can update their listing drafts" on public.listing_drafts for update to authenticated
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid() and exists (
    select 1 from public.users u where u.id = auth.uid() and u.campus_id = listing_drafts.campus_id));
drop policy if exists "Users can delete their listing drafts" on public.listing_drafts;
create policy "Users can delete their listing drafts" on public.listing_drafts for delete to authenticated
  using (seller_id = auth.uid());

-- 3. Photo bucket and policies (from 20261026000100_photo_storage.sql) -----------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-photos', 'listing-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "Users upload listing photos to their own folder" on storage.objects;
create policy "Users upload listing photos to their own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users delete their own listing photos" on storage.objects;
create policy "Users delete their own listing photos" on storage.objects for delete to authenticated
  using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- 4. Orders: Dibs goods have no seller user, one live order per listing, no direct client writes ----
alter table public.orders alter column seller_id drop not null;
create unique index if not exists orders_one_live_order_per_listing
  on public.orders (listing_id) where status in ('pending_payment', 'held', 'released');
-- Orders are created only by claim_listing and changed only by server-side functions.
drop policy if exists "Buyers can create orders" on public.orders;
drop policy if exists "Order participants can update orders" on public.orders;

-- 5. claim_listing: first claim wins, buyer comes from the session ---------------------------------
drop function if exists public.claim_listing(uuid, uuid);
create or replace function public.claim_listing(p_listing_id uuid, p_buyer_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_buyer_campus text;
  v_listing record;
  v_order_id uuid;
  v_quote jsonb;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error_code', 'NOT_SIGNED_IN', 'message', 'Sign in to call dibs.');
  end if;
  if p_buyer_id is not null and p_buyer_id <> v_uid then
    return jsonb_build_object('ok', false, 'error_code', 'FORBIDDEN', 'message', 'You can only claim as yourself.');
  end if;

  select u.campus_id into v_buyer_campus from public.users u where u.id = v_uid;

  select l.id, l.campus_id, l.status, l.seller_id, l.price_cents
    into v_listing
    from public.listings l
   where l.id = p_listing_id
     for update;

  if not found or v_buyer_campus is distinct from v_listing.campus_id then
    return jsonb_build_object('ok', false, 'error_code', 'NOT_FOUND', 'message', 'Listing not found.');
  end if;
  if v_listing.seller_id = v_uid then
    return jsonb_build_object('ok', false, 'error_code', 'VALIDATION', 'message', 'You cannot claim your own listing.');
  end if;
  if v_listing.status <> 'active' then
    return jsonb_build_object('ok', false, 'error_code', 'CONFLICT', 'message', 'Someone called dibs first.');
  end if;

  update public.listings set status = 'claimed', updated_at = now() where id = p_listing_id;

  -- Placeholder quote (item price only). payOrder replaces it with the getCheckoutQuote result.
  v_quote := jsonb_build_object(
    'lines', jsonb_build_array(jsonb_build_object('label', 'Item', 'kind', 'item', 'cents', v_listing.price_cents)),
    'totalCents', v_listing.price_cents);

  insert into public.orders (campus_id, listing_id, buyer_id, seller_id, status, quote, payout_quote)
  values (v_listing.campus_id, p_listing_id, v_uid, v_listing.seller_id, 'pending_payment', v_quote, v_quote)
  returning id into v_order_id;

  return jsonb_build_object('ok', true, 'order_id', v_order_id, 'listing_id', p_listing_id);
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'error_code', 'CONFLICT', 'message', 'Someone called dibs first.');
end;
$$;
revoke all on function public.claim_listing(uuid, uuid) from public, anon;
grant execute on function public.claim_listing(uuid, uuid) to authenticated;

-- 6. Payments: match the mock provider's insert, link to orders, add campus_id, add policies -------
alter table public.payments add column if not exists order_id uuid references public.orders (id) on delete set null;
alter table public.payments add column if not exists updated_at timestamptz not null default now();
alter table public.payments add column if not exists campus_id text;

create or replace function public.payments_fill_campus()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.campus_id is null then
    new.campus_id := coalesce(
      (select o.campus_id from public.orders o where o.id = new.order_id),
      (select u.campus_id from public.users u where u.id = auth.uid()),
      'unknown');
  end if;
  return new;
end;
$$;
revoke all on function public.payments_fill_campus() from public, anon, authenticated;
drop trigger if exists payments_fill_campus on public.payments;
create trigger payments_fill_campus before insert on public.payments
  for each row execute function public.payments_fill_campus();
update public.payments set campus_id = 'unknown' where campus_id is null;
alter table public.payments alter column campus_id set not null;

alter table public.payments enable row level security;
drop policy if exists "Order participants can read payments" on public.payments;
create policy "Order participants can read payments" on public.payments for select to authenticated
  using (exists (select 1 from public.orders o where o.id = payments.order_id and auth.uid() in (o.buyer_id, o.seller_id)));
drop policy if exists "Buyers can record payments for their orders" on public.payments;
create policy "Buyers can record payments for their orders" on public.payments for insert to authenticated
  with check (exists (select 1 from public.orders o where o.id = payments.order_id and o.buyer_id = auth.uid()));

-- 7. Admin write access for Dibs goods ----------------------------------------------------------------
drop policy if exists "Admins manage goods items" on public.goods_items;
create policy "Admins manage goods items" on public.goods_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins manage Dibs listings" on public.listings;
create policy "Admins manage Dibs listings" on public.listings for all to authenticated
  using (seller_type = 'dibs' and public.is_admin()) with check (seller_type = 'dibs' and public.is_admin());
drop policy if exists "Admins manage listing photos" on public.listing_photos;
create policy "Admins manage listing photos" on public.listing_photos for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 8. Table privileges for the Data API (RLS still decides which rows) -----------------------------------
grant usage on schema public to anon, authenticated, service_role;
grant select on public.campuses, public.price_tables to anon, authenticated;
grant select on public.meetup_spots, public.slots, public.credit_ledger_entries, public.orders to authenticated;
grant select, insert, update, delete on
  public.listings, public.listing_photos, public.listing_drafts, public.saved_listings,
  public.booking_add_ons, public.summer_hold_bookings, public.conversations,
  public.conversation_participants, public.messages, public.offer_events, public.goods_items
  to authenticated;
grant select, insert on public.payments to authenticated;
-- Users can read their row and change only their own profile fields (never role, campus or email).
grant select on public.users to authenticated;
grant update (first_name, last_initial, housing_type, dibs_gesture, verified) on public.users to authenticated;
grant all on all tables in schema public to service_role;
grant all on all functions in schema public to service_role;

-- 9. Function hardening ---------------------------------------------------------------------------------
alter function public.update_users_updated_at() set search_path = public, pg_temp;
do $$
begin
  if to_regprocedure('public.handle_new_auth_user()') is not null then
    revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;
  end if;
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;

-- 10. Realtime for live messages ----------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables
                      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
