-- Goods inventory fixture data corresponding to dibs-next/lib/fixtures/goods.ts.
do $$
begin
  create temporary table goods_seed_fixture (
    item_number integer,
    campus_id text,
    title text,
    category text,
    price_cents integer,
    cost_cents integer,
    serial_number text,
    hold_until timestamptz,
    status text,
    intake_date timestamptz
  ) on commit drop;

  insert into pg_temp.goods_seed_fixture values
    (1, 'riverside', 'Mesh task chair', 'furniture', 1500, 400, null, null, 'listed', '2026-09-02T17:00:00Z'::timestamptz),
    (2, 'riverside', 'Desk fan, 3 speed', 'dorm_essentials', 600, 100, null, null, 'listed', '2026-09-03T17:00:00Z'::timestamptz),
    (3, 'riverside', 'Storage bins, set of 3', 'dorm_essentials', 400, 0, null, null, 'listed', '2026-09-03T17:00:00Z'::timestamptz),
    (4, 'riverside', '22 in monitor', 'electronics', 2500, 600, 'MN22-4471-K', null, 'listed', '2026-09-05T17:00:00Z'::timestamptz),
    (5, 'riverside', 'Bookcase, 3 shelf', 'furniture', 1200, 200, null, null, 'listed', '2026-09-06T17:00:00Z'::timestamptz),
    (6, 'riverside', 'Microwave, 0.9 cu ft', 'kitchen', 1500, 300, null, null, 'listed', '2026-09-08T17:00:00Z'::timestamptz),
    (7, 'riverside', 'Space heater', 'other', 1000, 200, null, null, 'listed', '2026-09-09T17:00:00Z'::timestamptz),
    (8, 'riverside', 'Desk lamp with USB', 'dorm_essentials', 500, 0, null, null, 'listed', '2026-09-10T17:00:00Z'::timestamptz),
    (9, 'riverside', 'Cruiser bike', 'bikes_boards', 6000, 1500, 'WTU-0912-33', null, 'listed', '2026-09-12T17:00:00Z'::timestamptz),
    (10, 'riverside', 'Laptop, 13 in', 'electronics', 12000, 4000, 'C02-XK18-LP', '2026-10-31T07:00:00Z'::timestamptz, 'holding', '2026-10-01T17:00:00Z'::timestamptz),
    (11, 'riverside', 'Bluetooth speaker', 'electronics', 1500, 400, 'SPK-2210-9', '2026-11-01T07:00:00Z'::timestamptz, 'holding', '2026-10-02T17:00:00Z'::timestamptz),
    (12, 'riverside', 'Road bike', 'bikes_boards', 9000, 2500, 'WTU-1003-71', '2026-11-02T07:00:00Z'::timestamptz, 'holding', '2026-10-03T17:00:00Z'::timestamptz),
    (13, 'riverside', 'Graphing calculator', 'electronics', 3000, 800, 'TI-5521-88', '2026-11-03T07:00:00Z'::timestamptz, 'holding', '2026-10-04T17:00:00Z'::timestamptz),
    (14, 'riverside', 'Office chair', 'furniture', 2000, 500, null, null, 'intake', '2026-10-07T17:00:00Z'::timestamptz),
    (15, 'riverside', 'Rice cooker', 'kitchen', 1000, 200, null, null, 'intake', '2026-10-07T17:00:00Z'::timestamptz),
    (16, 'riverside', 'Mirror, full length', 'dorm_essentials', 800, 100, null, null, 'intake', '2026-10-08T17:00:00Z'::timestamptz),
    (17, 'riverside', 'Textbook bundle, chemistry', 'textbooks', 2000, 0, null, null, 'intake', '2026-10-08T17:00:00Z'::timestamptz),
    (18, 'riverside', 'Dining chairs, set of 2', 'furniture', 2500, 600, null, null, 'sold', '2026-08-28T17:00:00Z'::timestamptz),
    (19, 'riverside', 'Air fryer', 'kitchen', 2000, 500, null, null, 'sold', '2026-08-29T17:00:00Z'::timestamptz),
    (20, 'san-bernardino', 'Longboard', 'bikes_boards', 3000, 800, null, null, 'sold', '2026-08-30T17:00:00Z'::timestamptz),
    (21, 'san-bernardino', 'Rain jacket', 'clothing', 800, 0, null, null, 'listed', '2026-08-31T17:00:00Z'::timestamptz),
    (22, 'riverside', 'Keyboard', 'electronics', 600, 100, null, null, 'sold', '2026-09-01T17:00:00Z'::timestamptz),
    (23, 'riverside', 'Mattress topper', 'other', 0, 0, null, null, 'disposed', '2026-08-27T17:00:00Z'::timestamptz),
    (24, 'riverside', 'Broken desk lamp', 'dorm_essentials', 0, 0, null, null, 'disposed', '2026-08-27T17:00:00Z'::timestamptz),
    (25, 'riverside', 'Cracked monitor', 'electronics', 0, 0, null, null, 'disposed', '2026-08-29T17:00:00Z'::timestamptz);

  insert into public.listings (
    id,
    campus_id,
    seller_id,
    source,
    seller_type,
    title,
    description,
    price_cents,
    condition,
    category,
    housing_fit,
    status
  )
  select
    ('20000000-0000-4000-8000-' || lpad(fixture.item_number::text, 12, '0'))::uuid,
    fixture.campus_id,
    null,
    'goods',
    'dibs',
    fixture.title,
    '',
    fixture.price_cents,
    'good',
    fixture.category::public.listing_category,
    'dorm',
    case fixture.status
      when 'listed' then 'active'::public.listing_status
      when 'sold' then 'sold'::public.listing_status
      else 'removed'::public.listing_status
    end
  from pg_temp.goods_seed_fixture fixture
  where not exists (
    select 1
    from public.listings existing
    where existing.source = 'goods'
      and existing.campus_id = fixture.campus_id
      and existing.title = fixture.title
  )
  on conflict (id) do update
  set campus_id = excluded.campus_id,
      title = excluded.title,
      price_cents = excluded.price_cents,
      category = excluded.category,
      status = excluded.status,
      updated_at = now();

  insert into public.goods_items (
    id,
    campus_id,
    listing_id,
    cost_cents,
    serial_number,
    hold_until,
    status,
    intake_date
  )
  select
    ('30000000-0000-4000-8000-' || lpad(fixture.item_number::text, 12, '0'))::uuid,
    fixture.campus_id,
    listing.id,
    fixture.cost_cents,
    fixture.serial_number,
    fixture.hold_until,
    fixture.status::public.goods_status,
    fixture.intake_date
  from pg_temp.goods_seed_fixture fixture
  join public.listings listing
    on listing.source = 'goods'
    and listing.campus_id = fixture.campus_id
    and listing.title = fixture.title
  on conflict (id) do update
  set campus_id = excluded.campus_id,
      listing_id = excluded.listing_id,
      cost_cents = excluded.cost_cents,
      serial_number = excluded.serial_number,
      hold_until = excluded.hold_until,
      status = excluded.status,
      intake_date = excluded.intake_date,
      updated_at = now();
end;
$$;
