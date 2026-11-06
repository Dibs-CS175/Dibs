-- Meetup spots from dibs-next/lib/fixtures/campuses.ts. Safe to re-run.
insert into public.meetup_spots (campus_id, name, description)
select v.campus_id, v.name, v.description
from (values
  ('riverside', 'Transit center', 'Covered benches by the bus bays. Busy all day.'),
  ('riverside', 'Library front steps', 'Daytime only. Lots of foot traffic.'),
  ('riverside', 'Student union lobby', 'Indoors, staffed front desk.'),
  ('riverside', 'Rec center entrance', 'Well lit, open late.'),
  ('riverside', 'North parking structure, level 1', 'Good for large items you need a car for.'),
  ('san-bernardino', 'Library plaza', 'Open seating, busy between classes.'),
  ('san-bernardino', 'Student union patio', 'Daytime only.'),
  ('san-bernardino', 'Rec center lobby', 'Indoors, staffed front desk.'),
  ('san-bernardino', 'Main bus stop', 'Covered and well lit.'),
  ('san-bernardino', 'Lot D loading area', 'Good for large items you need a car for.')
) as v(campus_id, name, description)
where not exists (
  select 1 from public.meetup_spots m where m.campus_id = v.campus_id and m.name = v.name
);
