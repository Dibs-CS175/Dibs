import type {
  ConsignmentAdminView,
  ConsignmentTerms,
  ConsignmentView,
  PayoutMethod,
  Quote,
  SlotView,
  StorageItem,
  TimelineStep,
} from '@/lib/types';
import {
  CONSIGNMENT_COMMISSION_BPS,
  CONSIGNMENT_MIN_ASKING_PRICE_CENTS,
  CONSIGNMENT_OWNER_SHARE_BPS,
} from '@/lib/config/pricing';
import { listings } from './listings';
import { bookings } from './summerHold';
import { me, sellers } from './users';

export const STORAGE_PICKUP_SPOT = 'Arroyo Self Storage, Unit 14 (front office)';

/** Terms for the upcoming summer. The backend states them; the UI only displays them. */
export const consignmentTerms: ConsignmentTerms = {
  commissionBps: CONSIGNMENT_COMMISSION_BPS,
  ownerShareBps: CONSIGNMENT_OWNER_SHARE_BPS,
  minAskingPriceCents: CONSIGNMENT_MIN_ASKING_PRICE_CENTS,
  unsoldPolicy:
    'Items that have not sold by the end of the listing period become Dibs Goods. No payout is owed for them.',
  damagePolicy:
    'Damage caused by Dibs is paid out to you as if the item sold at your asking price. Damage caused by a buyer while collecting completes the sale. Other damage in storage is claimed against the storage facility.',
  listUntil: '2027-10-31T06:59:00Z',
};

/** Weekly windows when buyers collect consigned items at the storage unit. */
const win = (id: string, startsAt: string, endsAt: string, booked: number, isFull: boolean): SlotView => ({
  id,
  kind: 'storage_pickup',
  startsAt,
  endsAt,
  capacity: 8,
  booked,
  isFull,
});

export const storagePickupSlots: SlotView[] = [
  win('sp1', '2026-10-10T17:00:00Z', '2026-10-10T19:00:00Z', 8, true),
  win('sp2', '2026-10-13T23:00:00Z', '2026-10-14T01:00:00Z', 3, false),
  win('sp3', '2026-10-17T17:00:00Z', '2026-10-17T19:00:00Z', 5, false),
  win('sp4', '2026-10-20T23:00:00Z', '2026-10-21T01:00:00Z', 1, false),
  win('sp5', '2026-10-24T17:00:00Z', '2026-10-24T19:00:00Z', 8, true),
  win('sp6', '2026-10-27T23:00:00Z', '2026-10-28T01:00:00Z', 0, false),
];

/*
 * Payout quotes below are fixture values written as the backend would return them at the current
 * commission. The UI shows them as given and never computes a commission or payout itself.
 */
const payout = (
  saleCents: number,
  commissionCents: number,
  payoutCents: number,
  saleLabel = 'Sale price',
): Quote => ({
  lines: [
    { label: saleLabel, cents: saleCents },
    { label: 'Dibs commission', cents: -commissionCents },
  ],
  totalCents: payoutCents,
});

const done = (label: string, at: string): TimelineStep => ({ label, at, state: 'done' });
const cur = (label: string): TimelineStep => ({ label, state: 'current' });
const next = (label: string): TimelineStep => ({ label, state: 'upcoming' });

const LAST_CYCLE_UNTIL = '2026-10-31T06:59:00Z';

const stored = (
  id: string,
  label: string,
  askingPriceCents: number,
  extra: Partial<StorageItem> = {},
): StorageItem => ({
  id,
  bookingId: 'bk_2026',
  label,
  size: 'large',
  status: 'stored',
  disposition: 'sell',
  askingPriceCents,
  ...extra,
});

const pick = (id: string) => {
  const l = listings.find((x) => x.id === id)!;
  return { id: l.id, title: l.title, photos: l.photos, priceCents: l.priceCents, status: l.status };
};

const bike = bookings[0]!.items.find((i) => i.id === 'si3')!;

/** The signed-in student's consigned items, one per status. */
export const myConsignments: ConsignmentView[] = [
  {
    item: bike,
    bookingId: 'bk1',
    listing: null,
    status: 'awaiting_checkin',
    payout: null,
    listUntil: consignmentTerms.listUntil,
    timeline: [
      done('Marked to sell', '2026-10-02T18:00:00Z'),
      cur('Check-in at move-out pickup'),
      next('Listed by Dibs'),
      next('Sold and collected'),
      next('Payout sent'),
    ],
    canEditPrice: true,
    canWithdraw: true,
  },
  {
    item: stored('cs1', 'Standing desk', 7000, { binId: 'b5', conditionNote: 'Light scuffs on the top.' }),
    bookingId: 'bk_2026',
    listing: null,
    status: 'awaiting_listing',
    payout: null,
    listUntil: LAST_CYCLE_UNTIL,
    timeline: [
      done('Checked in', '2026-06-09T18:00:00Z'),
      cur('Dibs is photographing and listing it'),
      next('Sold and collected'),
      next('Payout sent'),
    ],
    canEditPrice: true,
    canWithdraw: true,
  },
  {
    item: stored('cs2', 'Mini fridge, 3.1 cu ft', 4500, { listingId: 'l41', binId: 'b2' }),
    bookingId: 'bk_2026',
    listing: pick('l41'),
    status: 'listed',
    payout: null,
    listUntil: LAST_CYCLE_UNTIL,
    timeline: [
      done('Checked in', '2026-06-09T18:00:00Z'),
      done('Listed by Dibs', '2026-06-12T17:00:00Z'),
      cur('Waiting for a buyer'),
      next('Payout sent'),
    ],
    canEditPrice: true,
    canWithdraw: true,
  },
  {
    item: stored('cs3', 'Bookshelf, 5 shelf', 3500, { listingId: 'l42', binId: 'b4' }),
    bookingId: 'bk_2026',
    listing: pick('l42'),
    status: 'sold',
    payout: payout(3500, 2100, 1400),
    listUntil: LAST_CYCLE_UNTIL,
    timeline: [
      done('Listed by Dibs', '2026-06-12T17:00:00Z'),
      done('Sold', '2026-10-05T20:00:00Z'),
      cur('Buyer collects at the storage unit'),
      next('Payout sent'),
    ],
    canEditPrice: false,
    canWithdraw: false,
  },
  {
    item: stored('cs4', 'Electric scooter', 15000, { listingId: 'l43', status: 'returned' }),
    bookingId: 'bk_2026',
    listing: pick('l43'),
    status: 'payout_pending',
    payout: payout(15000, 9000, 6000),
    listUntil: LAST_CYCLE_UNTIL,
    timeline: [
      done('Sold', '2026-09-24T19:00:00Z'),
      done('Collected by buyer', '2026-09-26T18:00:00Z'),
      cur('Payout processing'),
    ],
    canEditPrice: false,
    canWithdraw: false,
  },
  {
    item: stored('cs5', '27 in monitor', 8000, { listingId: 'l44', status: 'returned', size: 'standard' }),
    bookingId: 'bk_2026',
    listing: pick('l44'),
    status: 'paid_out',
    payout: payout(8000, 4800, 3200),
    payoutSentAt: '2026-09-12T17:00:00Z',
    listUntil: LAST_CYCLE_UNTIL,
    timeline: [
      done('Sold', '2026-09-05T19:00:00Z'),
      done('Collected by buyer', '2026-09-08T18:00:00Z'),
      done('Payout sent', '2026-09-12T17:00:00Z'),
    ],
    canEditPrice: false,
    canWithdraw: false,
  },
  {
    item: stored('cs6', 'Lounge chair', 4000, { status: 'stored' }),
    bookingId: 'bk_2025',
    listing: null,
    status: 'unsold_to_goods',
    payout: null,
    listUntil: '2025-10-31T06:59:00Z',
    timeline: [
      done('Listed by Dibs', '2025-06-12T17:00:00Z'),
      done('Listing period ended', '2025-10-31T06:59:00Z'),
      done('Moved to Dibs Goods', '2025-11-01T17:00:00Z'),
    ],
    canEditPrice: false,
    canWithdraw: false,
  },
  {
    item: stored('cs7', 'Coffee table', 3000, { status: 'returned', disposition: 'return' }),
    bookingId: 'bk_2026',
    listing: null,
    status: 'withdrawn',
    payout: null,
    listUntil: LAST_CYCLE_UNTIL,
    timeline: [
      done('Listed by Dibs', '2026-06-12T17:00:00Z'),
      done('Withdrawn, will be returned', '2026-07-01T17:00:00Z'),
    ],
    canEditPrice: false,
    canWithdraw: false,
  },
  {
    item: stored('cs8', 'Air purifier', 6000, {
      status: 'damaged',
      size: 'standard',
      conditionNote: 'Housing cracked during a bin move.',
    }),
    bookingId: 'bk_2026',
    listing: null,
    status: 'damaged',
    payout: payout(6000, 3600, 2400, 'Asking price (damaged by Dibs)'),
    payoutSentAt: '2026-08-02T17:00:00Z',
    listUntil: LAST_CYCLE_UNTIL,
    timeline: [
      done('Checked in', '2026-06-09T18:00:00Z'),
      done('Damaged by Dibs staff', '2026-07-28T17:00:00Z'),
      done('Paid out at asking price', '2026-08-02T17:00:00Z'),
    ],
    canEditPrice: false,
    canWithdraw: false,
  },
];

export const myPayoutMethod: PayoutMethod = { status: 'set', label: 'Bank account ending 4417' };

const owner = (u: { id: string; firstName: string; lastInitial: string }) => ({
  id: u.id,
  firstName: u.firstName,
  lastInitial: u.lastInitial,
});

/** Admin view: every consigned item with its owner. */
export const adminConsignments: ConsignmentAdminView[] = [
  ...myConsignments.map((c) => ({ ...c, owner: owner(me), payoutMethod: myPayoutMethod })),
  {
    ...myConsignments[1]!,
    item: stored('cs9', 'Futon frame', 5500, { binId: 'b8' }),
    owner: owner(sellers[3]!),
    payoutMethod: { status: 'not_set', label: null },
  },
  {
    ...myConsignments[4]!,
    item: stored('cs10', 'Air fryer', 3000, { size: 'standard', status: 'returned' }),
    listing: null,
    payout: payout(3000, 1800, 1200),
    owner: owner(sellers[6]!),
    payoutMethod: { status: 'not_set', label: null },
  },
];
