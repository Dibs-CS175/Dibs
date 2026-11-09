-- Listing fixture data corresponding to dibs-next/lib/fixtures/listings.ts.
-- Seller emails resolve to the UUIDs created by 003_users.sql.
with fixture (
  seller_email,
  source,
  title,
  description,
  price_cents,
  condition,
  category,
  housing_fit,
  status,
  hours_ago
) as (
  values
    ( 'maya.r@ucr.edu', 'student', 'LED desk lamp', 'Warm and cool modes, USB port in the base. LED only.', 800, 'like_new', 'dorm_essentials', 'dorm', 'claimed', 0.1),
    ( 'aaliyah.t@ucr.edu', 'student', 'Clip fan', 'Clips to a bed frame or desk. Two speeds, quiet on low.', 1000, 'good', 'dorm_essentials', 'dorm', 'active', 0.4),
    ( 'hana.k@ucr.edu', 'student', 'Storage bins, set of 4', 'Stackable clear bins with lids. Fit under a lofted bed.', 1200, 'good', 'dorm_essentials', 'dorm', 'active', 1.6),
    ( 'maya.r@ucr.edu', 'student', 'Full-length mirror', 'Over-the-door hooks, so no wall holes.', 1500, 'like_new', 'dorm_essentials', 'dorm', 'active', 3),
    ( 'aaliyah.t@ucr.edu', 'student', 'Shower caddy', 'Mesh caddy with a handle. Cleaned and dried.', 500, 'good', 'dorm_essentials', 'dorm', 'active', 5),
    ( 'imani.b@csusb.edu', 'student', 'Battery string lights', 'LED, battery pack, 20 ft. Free to whoever picks up first.', 0, 'good', 'dorm_essentials', 'dorm', 'active', 24),
    ( 'priya.s@ucr.edu', 'student', 'TI-84 Plus calculator', 'New batteries. Works for most math and chemistry exams.', 5500, 'good', 'electronics', 'dorm', 'active', 0.2),
    ( 'ravi.n@csusb.edu', 'student', '24 in monitor, 1080p', 'HDMI and USB-C cables included. No dead pixels.', 7000, 'like_new', 'electronics', 'dorm', 'active', 0.8),
    ( 'priya.s@ucr.edu', 'student', 'Mechanical keyboard', 'Tactile switches, full size.', 3500, 'like_new', 'electronics', 'dorm', 'active', 4),
    ( 'kenji.w@ucr.edu', 'student', 'Wireless printer', 'Prints from your phone. Half-full ink included.', 4000, 'good', 'electronics', 'dorm', 'active', 12),
    ( 'ravi.n@csusb.edu', 'student', 'Noise-canceling headphones', 'Over-ear, case included.', 6000, 'good', 'electronics', 'dorm', 'active', 0.6),
    ( 'jon.p@ucr.edu', 'student', 'Writing desk, 47 in', 'One drawer. You pick up; it needs a car.', 4000, 'good', 'furniture', 'apartment', 'active', 0.3),
    ( 'marcus.l@ucr.edu', 'student', 'Office chair', 'Adjustable height and arms. Mesh back.', 3500, 'good', 'furniture', 'apartment', 'active', 1.2),
    ( 'diego.m@ucr.edu', 'student', '5-shelf bookcase', 'A few scuffs. Disassembles with one screwdriver.', 2500, 'fair', 'furniture', 'apartment', 'active', 24),
    ( 'diego.m@ucr.edu', 'student', 'Futon with cover', 'Folds flat. Needs two people to move.', 9000, 'good', 'furniture', 'apartment', 'active', 48),
    ( 'marcus.l@ucr.edu', 'student', '2-seat sofa', 'Gray fabric. Fits through a standard door.', 12000, 'good', 'furniture', 'apartment', 'active', 10),
    ( 'tomas.v@csusb.edu', 'student', 'Nightstand', 'One drawer, one shelf.', 2000, 'like_new', 'furniture', 'apartment', 'active', 3.3),
    ( 'kenji.w@ucr.edu', 'student', 'Air fryer, 4 qt', 'Used about ten times.', 3000, 'like_new', 'kitchen', 'apartment', 'active', 0.5),
    ( 'tomas.v@csusb.edu', 'student', 'Rice cooker, 6 cup', 'Keeps warm for hours.', 1800, 'good', 'kitchen', 'apartment', 'active', 2.5),
    ( 'sofia.g@ucr.edu', 'student', 'Dish rack', 'Two-tier with utensil cup. Free.', 0, 'good', 'kitchen', 'apartment', 'active', 15),
    ( 'tomas.v@csusb.edu', 'student', '2-slice toaster', 'Wide slots. For off-campus kitchens only.', 800, 'good', 'kitchen', 'not_allowed', 'active', 24),
    ( 'hana.k@ucr.edu', 'student', 'General Chemistry, 11th ed.', 'Light highlighting in chapters 1 to 4.', 6000, 'good', 'textbooks', 'dorm', 'active', 0.1),
    ( 'priya.s@ucr.edu', 'student', 'Calculus: Early Transcendentals', 'No writing inside.', 4500, 'good', 'textbooks', 'dorm', 'active', 0.9),
    ( 'maya.r@ucr.edu', 'student', 'Intro Biology lab manual', 'Unused pages, binder-ready.', 2000, 'like_new', 'textbooks', 'dorm', 'active', 1.8),
    ( 'jon.p@ucr.edu', 'student', 'Road bike, 54 cm', 'Aluminum frame, 18 speeds, new tubes.', 12000, 'good', 'bikes_boards', 'dorm', 'active', 0.3),
    ( 'marcus.l@ucr.edu', 'student', 'Beach cruiser', 'Single speed, front basket.', 8000, 'good', 'bikes_boards', 'dorm', 'sold', 4.3),
    ( 'jon.p@ucr.edu', 'student', 'U-lock with cable', 'Two keys. Mount bracket included.', 1000, 'like_new', 'bikes_boards', 'dorm', 'active', 0.3),
    ( 'imani.b@csusb.edu', 'student', 'Rain jacket, M', 'Packable, hood included.', 1800, 'like_new', 'clothing', 'dorm', 'active', 1.4),
    ( 'alex.d@ucr.edu', 'student', 'TI-83 Plus calculator', 'Fresh batteries. Fine for MATH courses.', 4000, 'good', 'electronics', 'dorm', 'claimed', 5),
    ( 'alex.d@ucr.edu', 'student', 'Bamboo desk shelf', 'Sits on a desk and doubles the surface.', 1800, 'like_new', 'dorm_essentials', 'dorm', 'active', 24),
    ( 'goods.riverside@dibs.example', 'goods', 'Mesh task chair', 'Checked and cleaned by Dibs. From a move-out pickup.', 1500, 'good', 'furniture', 'apartment', 'active', 2),
    ( 'goods.riverside@dibs.example', 'goods', 'Desk fan, 3 speed', 'Tested and wiped down.', 600, 'good', 'dorm_essentials', 'dorm', 'active', 6),
    ( 'goods.riverside@dibs.example', 'goods', 'Storage bins, set of 3', 'Stackable, lids included.', 400, 'good', 'dorm_essentials', 'dorm', 'active', 9),
    ( 'goods.riverside@dibs.example', 'goods', '22 in monitor', 'HDMI cable included. Tested.', 2500, 'good', 'electronics', 'dorm', 'active', 20),
    ( 'goods.riverside@dibs.example', 'goods', 'Bookcase, 3 shelf', 'Some wear on the corners.', 1200, 'fair', 'furniture', 'apartment', 'active', 30),
    ( 'goods.riverside@dibs.example', 'goods', 'Microwave, 0.9 cu ft', 'Cleaned and tested. Halls already include one.', 1500, 'good', 'kitchen', 'apartment', 'active', 33),
    ( 'goods.riverside@dibs.example', 'goods', 'Space heater', 'Tip-over shutoff. Off-campus only.', 1000, 'good', 'other', 'not_allowed', 'active', 40),
    ( 'goods.riverside@dibs.example', 'goods', 'Desk lamp with USB', 'LED bulb included.', 500, 'good', 'dorm_essentials', 'dorm', 'active', 50),
    ( 'goods.san-bernardino@dibs.example', 'goods', 'Cruiser bike', 'Tuned up, new chain. Rust on the fenders.', 6000, 'fair', 'bikes_boards', 'dorm', 'active', 70),
    ( 'goods.san-bernardino@dibs.example', 'goods', 'Cookware set, 6 piece', 'Two pans, two pots, two lids.', 1400, 'good', 'kitchen', 'apartment', 'removed', 72)
)
insert into public.listings (
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
  status,
  created_at
)
select
  seller.campus_id,
  seller.id,
  fixture.source::public.listing_source,
  case fixture.source
    when 'goods' then 'dibs'::public.listing_seller_type
    else 'student'::public.listing_seller_type
  end,
  fixture.title,
  fixture.description,
  fixture.price_cents,
  fixture.condition::public.listing_condition,
  fixture.category::public.listing_category,
  fixture.housing_fit::public.listing_housing_fit,
  fixture.status::public.listing_status,
  timestamptz '2026-10-08 19:00:00+00' - (fixture.hours_ago::double precision * interval '1 hour')
from fixture
join public.users seller on seller.email = fixture.seller_email
where not exists (
  select 1
  from public.listings existing
  where existing.campus_id = seller.campus_id
    and existing.seller_id = seller.id
    and existing.source = fixture.source::public.listing_source
    and existing.title = fixture.title
);
