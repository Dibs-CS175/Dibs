create type public.listing_source as enum ('student', 'goods');
create type public.listing_seller_type as enum ('student', 'dibs');
create type public.listing_condition as enum ('new', 'like_new', 'good', 'fair');
create type public.listing_housing_fit as enum ('dorm', 'apartment', 'not_allowed');
create type public.listing_status as enum ('active', 'claimed', 'sold', 'removed');
create type public.listing_category as enum (
  'dorm_essentials', 'furniture', 'kitchen', 'textbooks',
  'electronics', 'bikes_boards', 'clothing', 'other'
);
create type public.order_status as enum (
  'pending_payment', 'held', 'released', 'cancelled', 'refunded'
);
create type public.message_kind as enum ('text', 'meetup_proposal');
create type public.booking_status as enum ('draft', 'registered', 'balance_paid', 'cancelled');
create type public.slot_kind as enum ('packing', 'pickup');
create type public.goods_status as enum ('intake', 'holding', 'listed', 'sold', 'disposed');
create type public.credit_reason as enum ('referral_given', 'referral_received');

alter table public.campuses enable row level security;
create policy "Anyone can read campuses"
  on public.campuses for select
  using (true);

alter table public.users
  add column dibs_gesture text not null default 'hold'
  check (dibs_gesture in ('hold', 'tap'));

create table public.price_tables (
  campus_id text primary key,
  starts_at timestamptz,
  ends_at timestamptz,
  item_standard_cents integer not null check (item_standard_cents >= 0),
  item_large_cents integer not null check (item_large_cents >= 0),
  standard_box_rule jsonb not null,
  registration_tiers jsonb not null default '[]'::jsonb,
  cancel_window_days integer not null check (cancel_window_days >= 0),
  balance_due_at timestamptz,
  full_service jsonb not null,
  add_ons jsonb not null default '[]'::jsonb,
  fees jsonb not null,
  coverage_per_item_cents integer not null check (coverage_per_item_cents >= 0),
  marketplace jsonb not null,
  sales_tax_rate numeric(8, 6) not null check (sales_tax_rate >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.price_tables enable row level security;
create policy "Authenticated users can read campus pricing"
  on public.price_tables for select
  to authenticated
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.campus_id = price_tables.campus_id
  ));

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  seller_id uuid references public.users (id),
  source public.listing_source not null,
  seller_type public.listing_seller_type not null,
  title text not null,
  description text not null default '',
  price_cents integer not null check (price_cents >= 0),
  condition public.listing_condition not null,
  category public.listing_category not null,
  housing_fit public.listing_housing_fit not null,
  status public.listing_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((source = 'goods') = (seller_type = 'dibs')),
  check (seller_type = 'dibs' or seller_id is not null)
);
alter table public.listings enable row level security;
create policy "Users can read campus listings"
  on public.listings for select
  to authenticated
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.campus_id = listings.campus_id
  ));
create policy "Users can create their own listings"
  on public.listings for insert
  to authenticated
  with check (
    seller_type = 'student'
    and seller_id = auth.uid()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.campus_id = listings.campus_id
    )
  );
create policy "Users can update their own listings"
  on public.listings for update
  to authenticated
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid());

create table public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  listing_id uuid not null references public.listings (id) on delete cascade,
  photo_url text not null,
  position integer not null check (position >= 0),
  created_at timestamptz not null default now(),
  unique (listing_id, position)
);
alter table public.listing_photos enable row level security;
create policy "Users can read campus listing photos"
  on public.listing_photos for select
  to authenticated
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.campus_id = listing_photos.campus_id
  ));
create policy "Listing owners can manage photos"
  on public.listing_photos for all
  to authenticated
  using (exists (
    select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.listings l
    where l.id = listing_id and l.seller_id = auth.uid() and l.campus_id = campus_id
  ));

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  listing_id uuid not null references public.listings (id),
  buyer_id uuid not null references public.users (id),
  seller_id uuid not null references public.users (id),
  status public.order_status not null default 'pending_payment',
  quote jsonb not null,
  payout_quote jsonb not null,
  handoff_code_hash text,
  meetup_spot_id uuid,
  meetup_time timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (buyer_id <> seller_id)
);
alter table public.orders enable row level security;
create policy "Order participants can read orders"
  on public.orders for select
  to authenticated
  using (auth.uid() in (buyer_id, seller_id));
create policy "Buyers can create orders"
  on public.orders for insert
  to authenticated
  with check (
    buyer_id = auth.uid()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.campus_id = orders.campus_id
    )
  );
create policy "Order participants can update orders"
  on public.orders for update
  to authenticated
  using (auth.uid() in (buyer_id, seller_id))
  with check (auth.uid() in (buyer_id, seller_id));

create table public.meetup_spots (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);
alter table public.meetup_spots enable row level security;
create policy "Users can read campus meetup spots"
  on public.meetup_spots for select
  to authenticated
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.campus_id = meetup_spots.campus_id
  ));
alter table public.orders
  add constraint orders_meetup_spot_fk
  foreign key (meetup_spot_id) references public.meetup_spots (id);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  listing_id uuid not null references public.listings (id),
  created_by uuid not null references public.users (id),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversation_participants (
  campus_id text not null,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  unread_count integer not null default 0 check (unread_count >= 0),
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);
alter table public.conversations enable row level security;
create policy "Conversation participants can read conversations"
  on public.conversations for select
  to authenticated
  using (exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = conversations.id and cp.user_id = auth.uid()
  ));
create policy "Campus users can create conversations"
  on public.conversations for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.campus_id = conversations.campus_id
    )
  );
alter table public.conversation_participants enable row level security;
create policy "Users can read their conversation memberships"
  on public.conversation_participants for select
  to authenticated
  using (user_id = auth.uid());
create policy "Conversation creator can add participants"
  on public.conversation_participants for insert
  to authenticated
  with check (exists (
    select 1 from public.conversations c
    where c.id = conversation_participants.conversation_id
      and c.created_by = auth.uid()
      and c.campus_id = conversation_participants.campus_id
  ));
create policy "Users can update their own conversation membership"
  on public.conversation_participants for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.users (id),
  body text not null,
  kind public.message_kind not null default 'text',
  meetup_spot_id uuid references public.meetup_spots (id),
  meetup_time timestamptz,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
alter table public.messages enable row level security;
create policy "Conversation participants can read messages"
  on public.messages for select
  to authenticated
  using (exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()
  ));
create policy "Participants can send messages as themselves"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()
    )
  );
create policy "Recipients can mark messages read"
  on public.messages for update
  to authenticated
  using (exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()
      and sender_id <> auth.uid()
  ))
  with check (exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()
      and sender_id <> auth.uid()
  ));

create table public.slots (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  kind public.slot_kind not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity integer not null check (capacity >= 0),
  booked integer not null default 0 check (booked >= 0 and booked <= capacity),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
alter table public.slots enable row level security;
create policy "Users can read campus slots"
  on public.slots for select
  to authenticated
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.campus_id = slots.campus_id
  ));

create table public.summer_hold_bookings (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  user_id uuid not null references public.users (id),
  status public.booking_status not null default 'draft',
  housing_type public.user_housing_type not null,
  address text not null,
  standard_count integer not null default 0 check (standard_count >= 0),
  large_count integer not null default 0 check (large_count >= 0),
  registration_tier_key text not null,
  full_service boolean not null default false,
  packing_slot_id uuid references public.slots (id),
  referral_code text,
  parent_pay_token text unique,
  quote jsonb not null,
  registered_at timestamptz,
  free_cancel_until timestamptz,
  balance_due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.summer_hold_bookings enable row level security;
create policy "Users can read their bookings"
  on public.summer_hold_bookings for select
  to authenticated
  using (user_id = auth.uid());
create policy "Users can create their bookings"
  on public.summer_hold_bookings for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.campus_id = summer_hold_bookings.campus_id
    )
  );
create policy "Users can update their draft bookings"
  on public.summer_hold_bookings for update
  to authenticated
  using (user_id = auth.uid() and status = 'draft')
  with check (user_id = auth.uid());

create table public.booking_add_ons (
  campus_id text not null,
  booking_id uuid not null references public.summer_hold_bookings (id) on delete cascade,
  add_on_key text not null,
  primary key (booking_id, add_on_key)
);
alter table public.booking_add_ons enable row level security;
create policy "Users can read their booking add-ons"
  on public.booking_add_ons for select
  to authenticated
  using (exists (
    select 1 from public.summer_hold_bookings b
    where b.id = booking_id and b.user_id = auth.uid()
  ));
create policy "Users can manage add-ons on their draft bookings"
  on public.booking_add_ons for all
  to authenticated
  using (exists (
    select 1 from public.summer_hold_bookings b
    where b.id = booking_id and b.user_id = auth.uid() and b.status = 'draft'
  ))
  with check (exists (
    select 1 from public.summer_hold_bookings b
    where b.id = booking_id and b.user_id = auth.uid()
      and b.campus_id = campus_id and b.status = 'draft'
  ));

create table public.goods_items (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  listing_id uuid references public.listings (id) on delete cascade,
  cost_cents integer check (cost_cents is null or cost_cents >= 0),
  serial_number text,
  hold_until timestamptz,
  status public.goods_status not null default 'intake',
  intake_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index goods_items_listing_id_key
  on public.goods_items (listing_id)
  where listing_id is not null;
alter table public.goods_items enable row level security;
create policy "Campus users can read Dibs goods"
  on public.goods_items for select
  to authenticated
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.campus_id = goods_items.campus_id
  ));

create table public.saved_listings (
  campus_id text not null,
  user_id uuid not null references public.users (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);
alter table public.saved_listings enable row level security;
create policy "Users can manage their saved listings"
  on public.saved_listings for all
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.campus_id = saved_listings.campus_id
    )
  );

create table public.credit_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  user_id uuid not null references public.users (id),
  cents integer not null check (cents > 0),
  reason public.credit_reason not null,
  created_at timestamptz not null default now()
);
alter table public.credit_ledger_entries enable row level security;
create policy "Users can read their credit ledger"
  on public.credit_ledger_entries for select
  to authenticated
  using (user_id = auth.uid());

create table public.offer_events (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null,
  user_id uuid not null references public.users (id),
  offer_key text not null,
  shown_at timestamptz not null default now(),
  chosen boolean,
  created_at timestamptz not null default now()
);
alter table public.offer_events enable row level security;
create policy "Users can read their offer events"
  on public.offer_events for select
  to authenticated
  using (user_id = auth.uid());
create policy "Users can record their offer events"
  on public.offer_events for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.campus_id = offer_events.campus_id
    )
  );
create policy "Users can update their offer choices"
  on public.offer_events for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
