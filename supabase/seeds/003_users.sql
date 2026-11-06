--- Seeds in fixture user data from fixtures
--- Fixes the auth.users table and the public.users table to match the fixture data.
do $$
begin
  insert into auth.users (
    id,
    aud,
    role,
    email,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  select
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    fixture.email,
    fixture.member_since,
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('first_name', fixture.first_name, 'last_initial', fixture.last_initial),
    fixture.member_since,
    now()
  from (
    values
      ('alex.d@ucr.edu', 'Alex', 'D', '2025-09-20T17:00:00Z'::timestamptz),
      ('jordan.k@ucr.edu', 'Jordan', 'K', '2025-08-01T17:00:00Z'::timestamptz),
      ('goods.riverside@dibs.example', 'Dibs Goods', '', '2025-08-01T17:00:00Z'::timestamptz),
      ('goods.san-bernardino@dibs.example', 'Dibs Goods', '', '2026-08-01T17:00:00Z'::timestamptz),
      ('maya.r@ucr.edu', 'Maya', 'R', '2025-09-15T17:00:00Z'::timestamptz),
      ('jon.p@ucr.edu', 'Jon', 'P', '2025-09-15T17:00:00Z'::timestamptz),
      ('priya.s@ucr.edu', 'Priya', 'S', '2025-09-22T17:00:00Z'::timestamptz),
      ('diego.m@ucr.edu', 'Diego', 'M', '2026-01-10T17:00:00Z'::timestamptz),
      ('aaliyah.t@ucr.edu', 'Aaliyah', 'T', '2025-09-29T17:00:00Z'::timestamptz),
      ('kenji.w@ucr.edu', 'Kenji', 'W', '2026-03-30T17:00:00Z'::timestamptz),
      ('sofia.g@ucr.edu', 'Sofia', 'G', '2026-04-02T17:00:00Z'::timestamptz),
      ('marcus.l@ucr.edu', 'Marcus', 'L', '2025-09-15T17:00:00Z'::timestamptz),
      ('hana.k@ucr.edu', 'Hana', 'K', '2026-01-12T17:00:00Z'::timestamptz),
      ('tomas.v@csusb.edu', 'Tomás', 'V', '2025-09-18T17:00:00Z'::timestamptz),
      ('imani.b@csusb.edu', 'Imani', 'B', '2025-09-25T17:00:00Z'::timestamptz),
      ('ravi.n@csusb.edu', 'Ravi', 'N', '2026-01-08T17:00:00Z'::timestamptz)
  ) as fixture (email, first_name, last_initial, member_since)
  where not exists (
    select 1 from auth.users existing
    where lower(existing.email) = fixture.email
  );
  with fixture_users (
    email, campus_id, first_name, last_initial, housing_type, role,
    verified, trades_count, member_since, referral_code
  ) as (
    values
      (
        'alex.d@ucr.edu', 'riverside', 'Alex', 'D', 'hall'::public.user_housing_type,
        'student'::public.user_role, true, 11, '2025-09-20T17:00:00Z'::timestamptz, 'ALEX-7KD2'
      ),
      (
        'jordan.k@ucr.edu', 'riverside', 'Jordan', 'K', 'off_campus'::public.user_housing_type,
        'admin'::public.user_role, true, 0, '2025-08-01T17:00:00Z'::timestamptz, 'JORDAN-3QP8'
      ),
      (
        'goods.riverside@dibs.example', 'riverside', 'Dibs Goods', '', null,
        'admin'::public.user_role, true, 214, '2025-08-01T17:00:00Z'::timestamptz, 'GOODS-R'
      ),
      (
        'goods.san-bernardino@dibs.example', 'san-bernardino', 'Dibs Goods', '', null,
        'admin'::public.user_role, true, 12, '2026-08-01T17:00:00Z'::timestamptz, 'GOODS-S'
      ),
      (
        'maya.r@ucr.edu', 'riverside', 'Maya', 'R', 'hall'::public.user_housing_type,
        'student'::public.user_role, true, 23, '2025-09-15T17:00:00Z'::timestamptz, 'MAYA-R81'
      ),
      (
        'jon.p@ucr.edu', 'riverside', 'Jon', 'P', 'off_campus'::public.user_housing_type,
        'student'::public.user_role, true, 17, '2025-09-15T17:00:00Z'::timestamptz, 'JON-P22'
      ),
      (
        'priya.s@ucr.edu', 'riverside', 'Priya', 'S', 'campus_apartment'::public.user_housing_type,
        'student'::public.user_role, true, 31, '2025-09-22T17:00:00Z'::timestamptz, 'PRIYA-S09'
      ),
      (
        'diego.m@ucr.edu', 'riverside', 'Diego', 'M', 'off_campus'::public.user_housing_type,
        'student'::public.user_role, true, 9, '2026-01-10T17:00:00Z'::timestamptz, 'DIEGO-M44'
      ),
      (
        'aaliyah.t@ucr.edu', 'riverside', 'Aaliyah', 'T', 'hall'::public.user_housing_type,
        'student'::public.user_role, true, 14, '2025-09-29T17:00:00Z'::timestamptz, 'AALI-T15'
      ),
      (
        'kenji.w@ucr.edu', 'riverside', 'Kenji', 'W', 'campus_apartment'::public.user_housing_type,
        'student'::public.user_role, true, 12, '2026-03-30T17:00:00Z'::timestamptz, 'KENJI-W60'
      ),
      (
        'sofia.g@ucr.edu', 'riverside', 'Sofia', 'G', 'commuter'::public.user_housing_type,
        'student'::public.user_role, true, 6, '2026-04-02T17:00:00Z'::timestamptz, 'SOFIA-G07'
      ),
      (
        'marcus.l@ucr.edu', 'riverside', 'Marcus', 'L', 'off_campus'::public.user_housing_type,
        'student'::public.user_role, true, 27, '2025-09-15T17:00:00Z'::timestamptz, 'MARC-L38'
      ),
      (
        'hana.k@ucr.edu', 'riverside', 'Hana', 'K', 'hall'::public.user_housing_type,
        'student'::public.user_role, true, 8, '2026-01-12T17:00:00Z'::timestamptz, 'HANA-K19'
      ),
      (
        'tomas.v@csusb.edu', 'san-bernardino', 'Tomás', 'V', 'campus_apartment'::public.user_housing_type,
        'student'::public.user_role, true, 19, '2025-09-18T17:00:00Z'::timestamptz, 'TOMAS-V10'
      ),
      (
        'imani.b@csusb.edu', 'san-bernardino', 'Imani', 'B', 'off_campus'::public.user_housing_type,
        'student'::public.user_role, true, 22, '2025-09-25T17:00:00Z'::timestamptz, 'IMANI-B11'
      ),
      (
        'ravi.n@csusb.edu', 'san-bernardino', 'Ravi', 'N', 'off_campus'::public.user_housing_type,
        'student'::public.user_role, true, 15, '2026-01-08T17:00:00Z'::timestamptz, 'RAVI-N12'
      )
  )
  insert into public.users (
    id,
    campus_id,
    first_name,
    last_initial,
    email,
    housing_type,
    role,
    verified,
    trades_count,
    member_since,
    referral_code
  )
  select
    auth_user.id,
    fixture_users.campus_id,
    fixture_users.first_name,
    fixture_users.last_initial,
    fixture_users.email,
    fixture_users.housing_type,
    fixture_users.role,
    fixture_users.verified,
    fixture_users.trades_count,
    fixture_users.member_since,
    fixture_users.referral_code
  from fixture_users
  join auth.users auth_user on lower(auth_user.email) = fixture_users.email
  on conflict (id) do update
  set campus_id = excluded.campus_id,
      first_name = excluded.first_name,
      last_initial = excluded.last_initial,
      email = excluded.email,
      housing_type = excluded.housing_type,
      role = excluded.role,
      verified = excluded.verified,
      trades_count = excluded.trades_count,
      member_since = excluded.member_since,
      referral_code = excluded.referral_code,
      updated_at = now();
end;
$$;