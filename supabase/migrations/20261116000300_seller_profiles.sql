-- Lets a student see the public part of another student's profile on listings.
-- Row-level security on public.users only lets a user read their own row, so listing queries could
-- not read any other seller: Browse showed other students' listings with no name or verified badge,
-- and opening one failed with "Seller profile not found".
-- Idempotent: safe on the live project and on a fresh `supabase db reset`.

-- Returns only what a listing shows about its seller. Email, referral code, housing type and role
-- stay private, which a broader read policy on users could not guarantee.
-- Security definer because of the users policy; it only returns users on the caller's own campus,
-- and returns nothing when signed out.
create or replace function public.seller_profiles(p_ids uuid[])
returns table (
  id uuid,
  first_name text,
  last_initial text,
  verified boolean,
  trades_count integer,
  member_since timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select u.id, u.first_name, u.last_initial, u.verified, u.trades_count, u.member_since
    from public.users u
   where u.id = any (p_ids)
     and u.campus_id = (select me.campus_id from public.users me where me.id = auth.uid());
$$;

revoke all on function public.seller_profiles(uuid[]) from public, anon;
grant execute on function public.seller_profiles(uuid[]) to authenticated;
