-- Seeds the Summer Hold packing appointments and move-out pickup windows.
-- Safe to run more than once. A slot is identified by campus, kind and start time; one that already
-- exists is left alone, so re-running never duplicates slots or resets a live `booked` count.

insert into public.slots (campus_id, kind, starts_at, ends_at, capacity, booked)
select v.campus_id, v.kind::public.slot_kind, v.starts_at::timestamptz, v.ends_at::timestamptz, v.capacity, v.booked
from (
  values
    -- Packing appointments (Full Service)
    ('riverside', 'packing', '2027-06-03T16:00:00Z', '2027-06-03T18:00:00Z', 4, 4),
    ('riverside', 'packing', '2027-06-03T20:00:00Z', '2027-06-03T22:00:00Z', 4, 1),
    ('riverside', 'packing', '2027-06-04T16:00:00Z', '2027-06-04T18:00:00Z', 4, 2),
    ('riverside', 'packing', '2027-06-04T20:00:00Z', '2027-06-04T22:00:00Z', 4, 4),
    ('riverside', 'packing', '2027-06-05T16:00:00Z', '2027-06-05T18:00:00Z', 4, 0),
    ('riverside', 'packing', '2027-06-05T20:00:00Z', '2027-06-05T22:00:00Z', 4, 3),
    ('san-bernardino', 'packing', '2027-06-03T16:00:00Z', '2027-06-03T18:00:00Z', 3, 1),
    ('san-bernardino', 'packing', '2027-06-04T16:00:00Z', '2027-06-04T18:00:00Z', 3, 3),
    -- Move-out pickup windows
    ('riverside', 'pickup', '2027-06-07T16:00:00Z', '2027-06-07T18:00:00Z', 12, 12),
    ('riverside', 'pickup', '2027-06-07T20:00:00Z', '2027-06-07T22:00:00Z', 12, 7),
    ('riverside', 'pickup', '2027-06-08T16:00:00Z', '2027-06-08T18:00:00Z', 12, 4),
    ('riverside', 'pickup', '2027-06-08T20:00:00Z', '2027-06-08T22:00:00Z', 12, 12),
    ('riverside', 'pickup', '2027-06-09T16:00:00Z', '2027-06-09T18:00:00Z', 12, 9),
    ('riverside', 'pickup', '2027-06-10T16:00:00Z', '2027-06-10T18:00:00Z', 12, 2),
    ('riverside', 'pickup', '2027-06-11T16:00:00Z', '2027-06-11T18:00:00Z', 12, 12),
    ('riverside', 'pickup', '2027-06-12T16:00:00Z', '2027-06-12T18:00:00Z', 12, 5),
    ('san-bernardino', 'pickup', '2027-06-08T16:00:00Z', '2027-06-08T18:00:00Z', 8, 2),
    ('san-bernardino', 'pickup', '2027-06-09T16:00:00Z', '2027-06-09T18:00:00Z', 8, 8)
) as v (campus_id, kind, starts_at, ends_at, capacity, booked)
where not exists (
  select 1
  from public.slots s
  where s.campus_id = v.campus_id
    and s.kind = v.kind::public.slot_kind
    and s.starts_at = v.starts_at::timestamptz
);
