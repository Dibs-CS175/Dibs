import type { Order, OrderDetail, TimelineStep } from '@/lib/types';

/**
 * Orders without their quotes. The orders stubs attach `quote` and `payoutQuote` from the pricing
 * stub helpers, so the price table stays the only source of fee values.
 */
export type OrderRecord = Omit<Order, 'quote' | 'payoutQuote'>;

const r = 'riverside';

export const orderRecords: OrderRecord[] = [
  {
    id: 'o1',
    campusId: r,
    listingId: 'l01',
    buyerId: 'u_me',
    sellerId: 'u_s01',
    status: 'held',
    handoffCodeVisibleToBuyer: '4821',
    meetupSpotId: 'ms_r2',
    meetupTime: '2026-10-12T22:00:00Z',
    createdAt: '2026-10-12T18:50:00Z',
  },
  {
    id: 'o2',
    campusId: r,
    listingId: 'l29',
    buyerId: 'u_s03',
    sellerId: 'u_me',
    status: 'held',
    attemptsRemaining: 2,
    meetupSpotId: 'ms_r1',
    meetupTime: '2026-10-13T00:00:00Z',
    createdAt: '2026-10-12T14:00:00Z',
  },
  {
    id: 'o3',
    campusId: r,
    listingId: 'l09',
    buyerId: 'u_me',
    sellerId: 'u_s03',
    status: 'pending_payment',
    createdAt: '2026-10-12T19:05:00Z',
  },
  {
    id: 'o4',
    campusId: r,
    listingId: 'l13',
    buyerId: 'u_me',
    sellerId: 'u_s08',
    status: 'released',
    meetupSpotId: 'ms_r3',
    meetupTime: '2026-10-07T23:00:00Z',
    createdAt: '2026-10-07T18:00:00Z',
  },
  {
    id: 'o5',
    campusId: r,
    listingId: 'l30',
    buyerId: 'u_s05',
    sellerId: 'u_me',
    status: 'released',
    meetupSpotId: 'ms_r2',
    meetupTime: '2026-09-30T20:00:00Z',
    createdAt: '2026-09-30T17:00:00Z',
  },
  {
    id: 'o6',
    campusId: r,
    listingId: 'l18',
    buyerId: 'u_me',
    sellerId: 'u_s06',
    status: 'cancelled',
    createdAt: '2026-10-03T16:00:00Z',
  },
  {
    id: 'o7',
    campusId: r,
    listingId: 'l22',
    buyerId: 'u_me',
    sellerId: 'u_s09',
    status: 'refunded',
    createdAt: '2026-09-28T16:00:00Z',
  },
  {
    id: 'o8',
    campusId: r,
    listingId: 'l34',
    buyerId: 'u_me',
    sellerId: 'u_goods',
    status: 'held',
    handoffCodeVisibleToBuyer: '5530',
    meetupSpotId: 'ms_r5',
    meetupTime: '2026-10-14T18:00:00Z',
    createdAt: '2026-10-11T16:00:00Z',
  },
];

const done = (label: string, at: string): TimelineStep => ({ label, at, state: 'done' });
const cur = (label: string): TimelineStep => ({ label, state: 'current' });
const next = (label: string): TimelineStep => ({ label, state: 'upcoming' });

/** Timeline and flags per order, as the backend would return them. */
export const orderExtras: Record<string, Pick<OrderDetail, 'timeline' | 'canCancel'>> = {
  o1: {
    timeline: [
      done('Payment held by Dibs Protect', '2026-10-12T18:50:00Z'),
      cur('Meet up and hand over your code'),
      next('Payment released'),
    ],
    canCancel: true,
  },
  o2: {
    timeline: [
      done('Payment held by Dibs Protect', '2026-10-12T14:00:00Z'),
      cur('Meet up and enter the buyer’s code'),
      next('Payment released'),
    ],
    canCancel: true,
  },
  o3: {
    timeline: [cur('Waiting for payment'), next('Payment held by Dibs Protect'), next('Payment released')],
    canCancel: true,
  },
  o4: {
    timeline: [
      done('Payment held by Dibs Protect', '2026-10-07T18:00:00Z'),
      done('Code entered at handoff', '2026-10-07T23:05:00Z'),
      done('Payment released', '2026-10-07T23:05:00Z'),
    ],
    canCancel: false,
  },
  o5: {
    timeline: [
      done('Payment held by Dibs Protect', '2026-09-30T17:00:00Z'),
      done('Code entered at handoff', '2026-09-30T20:05:00Z'),
      done('Payment released', '2026-09-30T20:05:00Z'),
    ],
    canCancel: false,
  },
  o6: {
    timeline: [
      done('Payment held by Dibs Protect', '2026-10-03T16:00:00Z'),
      done('Cancelled by buyer', '2026-10-03T18:00:00Z'),
    ],
    canCancel: false,
  },
  o7: {
    timeline: [
      done('Payment held by Dibs Protect', '2026-09-28T16:00:00Z'),
      done('Seller didn’t show', '2026-09-29T17:00:00Z'),
      done('Refunded', '2026-09-29T17:30:00Z'),
    ],
    canCancel: false,
  },
  o8: {
    timeline: [
      done('Payment held by Dibs Protect', '2026-10-11T16:00:00Z'),
      cur('Pick up from Dibs Goods and hand over your code'),
      next('Done'),
    ],
    canCancel: true,
  },
};

/** The order a successful Hold to Dibs returns in the stub. */
export const newHeldOrder = (listingId: string, sellerId: string): OrderRecord => ({
  id: 'o_new',
  campusId: r,
  listingId,
  buyerId: 'u_me',
  sellerId,
  status: 'held',
  handoffCodeVisibleToBuyer: '7316',
  createdAt: '2026-10-12T19:00:00Z',
});
