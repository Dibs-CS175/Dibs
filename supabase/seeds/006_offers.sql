-- Offer event fixtures corresponding to dibs-next/lib/fixtures/offers.ts.
-- The database generates each event ID from the offer_events.id default.
with fixture (user_email, campus_id, offer_key, shown_at, chosen) as (
  values
    ('alex.d@ucr.edu', 'riverside', 'registration_tier:early', '2026-10-02T17:50:00Z'::timestamptz, true),
    ('alex.d@ucr.edu', 'riverside', 'full_service', '2026-10-02T17:52:00Z'::timestamptz, true),
    ('alex.d@ucr.edu', 'riverside', 'addon:protect_plus', '2026-10-02T17:53:00Z'::timestamptz, false),
    ('alex.d@ucr.edu', 'riverside', 'addon:priority_window', '2026-10-02T17:53:00Z'::timestamptz, false),
    ('alex.d@ucr.edu', 'riverside', 'addon:delivery', '2026-10-02T17:53:00Z'::timestamptz, false),
    ('aaliyah.t@ucr.edu', 'riverside', 'registration_tier:early', '2026-09-25T17:40:00Z'::timestamptz, true),
    ('aaliyah.t@ucr.edu', 'riverside', 'addon:protect_plus', '2026-09-25T17:44:00Z'::timestamptz, true),
    ('aaliyah.t@ucr.edu', 'riverside', 'addon:delivery', '2026-09-25T17:44:00Z'::timestamptz, true),
    ('hana.k@ucr.edu', 'riverside', 'full_service', '2026-10-10T19:10:00Z'::timestamptz, null),
    ('imani.b@csusb.edu', 'san-bernardino', 'registration_tier:early', '2026-10-11T20:00:00Z'::timestamptz, null)
)
insert into public.offer_events (
  campus_id,
  user_id,
  offer_key,
  shown_at,
  chosen
)
select
  fixture.campus_id,
  users.id,
  fixture.offer_key,
  fixture.shown_at,
  fixture.chosen
from fixture
join public.users on users.email = fixture.user_email
where not exists (
  select 1
  from public.offer_events existing
  where existing.campus_id = fixture.campus_id
    and existing.user_id = users.id
    and existing.offer_key = fixture.offer_key
    and existing.shown_at = fixture.shown_at
);
