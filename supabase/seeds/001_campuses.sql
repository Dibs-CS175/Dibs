-- Seeds only the Campus records exported from dibs-next/lib/fixtures/campuses.ts.
insert into public.campuses (id, name, email_domain, timezone)
values
  ('riverside', 'Riverside', 'ucr.edu', 'America/Los_Angeles'),
  ('san-bernardino', 'San Bernardino', 'csusb.edu', 'America/Los_Angeles')
on conflict (id) do update
set name = excluded.name,
    email_domain = excluded.email_domain,
    timezone = excluded.timezone;