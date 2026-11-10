--- Seeds in fixture data into the database of slots tables.

-- slot = 
--   id: uuid,
--   campusId: string,
--   kind: 'packing' | 'pickup',
--   startsAt: string,
--   endsAt: string,
--   capacity: number,
--   booked: number,
--   created_at
--   updated_at

insert into public.slots(
    id,
    campus_id,
    kind,
    starts_at,
    ends_at,
    capacity,
    booked,
    created_at,
    updated_at
)
values 
(gen_random_uuid(), 'riverside', 'packing', '2027-06-03T16:00:00Z', '2027-06-03T18:00:00Z', 4, 4, now(), now()),
(gen_random_uuid(), 'riverside', 'packing', '2027-06-03T20:00:00Z', '2027-06-03T22:00:00Z', 4, 1, now(), now()),
  (gen_random_uuid(), 'riverside', 'packing', '2027-06-04T16:00:00Z', '2027-06-04T18:00:00Z', 4, 2, now(), now()),
  (gen_random_uuid(), 'riverside', 'packing', '2027-06-04T20:00:00Z', '2027-06-04T22:00:00Z', 4, 4, now(), now()),
  (gen_random_uuid(), 'riverside', 'packing', '2027-06-05T16:00:00Z', '2027-06-05T18:00:00Z', 4, 0, now(), now()),
  (gen_random_uuid(), 'riverside', 'packing', '2027-06-05T20:00:00Z', '2027-06-05T22:00:00Z', 4, 3, now(), now()),
  (gen_random_uuid(), 'san-bernardino', 'packing', '2027-06-03T16:00:00Z', '2027-06-03T18:00:00Z', 3, 1, now(), now()),
  (gen_random_uuid(), 'san-bernardino', 'packing', '2027-06-04T16:00:00Z', '2027-06-04T18:00:00Z', 3, 3, now(), now()),

-- First was the packing slots, next is pickup slots

  (gen_random_uuid(), 'riverside', 'pickup', '2027-06-07T16:00:00Z', '2027-06-07T18:00:00Z', 12, 12,  now(), now()),
  (gen_random_uuid(), 'riverside', 'pickup', '2027-06-07T20:00:00Z', '2027-06-07T22:00:00Z', 12, 7,  now(), now()),
  (gen_random_uuid(), 'riverside', 'pickup', '2027-06-08T16:00:00Z', '2027-06-08T18:00:00Z', 12, 4,  now(), now()),
  (gen_random_uuid(), 'riverside', 'pickup', '2027-06-08T20:00:00Z', '2027-06-08T22:00:00Z', 12, 12, now(), now()),
  (gen_random_uuid(), 'riverside', 'pickup', '2027-06-09T16:00:00Z', '2027-06-09T18:00:00Z', 12, 9,  now(), now()),
  (gen_random_uuid(), 'riverside', 'pickup', '2027-06-10T16:00:00Z', '2027-06-10T18:00:00Z', 12, 2,  now(), now()),
  (gen_random_uuid(), 'riverside', 'pickup', '2027-06-11T16:00:00Z', '2027-06-11T18:00:00Z', 12, 12, now(), now()),
  (gen_random_uuid(), 'riverside', 'pickup', '2027-06-12T16:00:00Z', '2027-06-12T18:00:00Z', 12, 5, now(), now()),
  (gen_random_uuid(), 'san-bernardino', 'pickup', '2027-06-08T16:00:00Z', '2027-06-08T18:00:00Z', 8, 2, now(), now()),
  (gen_random_uuid(), 'san-bernardino', 'pickup', '2027-06-09T16:00:00Z', '2027-06-09T18:00:00Z', 8, 8, now(), now())

on conflict (id) do update 
set kind = excluded.kind,
    starts_at = excluded.starts_at,
    ends_at = excluded.ends_at,
    capacity = excluded.capacity,
    booked = excluded.booked,
    updated_at = now();





