import { DIBS_PROTECT_FEE_CENTS } from '@/lib/config/pricing';
import type { Order, OrderDetail, Quote, Rating, Report, TimelineStep } from '@/lib/types';

/**
 * Fixture quotes. Fee lines come from the pricing placeholders. Totals are the asking price because every
 * placeholder is 0; the real quote, total included, comes from the backend.
 */
const quote = (priceCents: number): Quote => ({
  lines: [
    { label: 'Item', cents: priceCents },
    { label: 'Dibs Protect fee', cents: DIBS_PROTECT_FEE_CENTS },
  ],
  totalCents: priceCents,
});

export const orders: Order[] = [
  {
    id: 'o1',
    listingId: 'l01',
    buyerId: 'u_me',
    sellerId: 'u_s01',
    status: 'held',
    quote: quote(800),
    handoffCodeVisibleToBuyer: '4821',
    meetupSpot: 'Library front steps (daytime)',
    meetupTime: '2026-10-08T22:00:00Z',
    createdAt: '2026-10-08T18:50:00Z',
  },
  {
    id: 'o2',
    listingId: 'l29',
    buyerId: 'u_s03',
    sellerId: 'u_me',
    status: 'held',
    quote: quote(4000),
    meetupSpot: 'Campus transit center',
    meetupTime: '2026-10-09T00:00:00Z',
    createdAt: '2026-10-08T14:00:00Z',
  },
  {
    id: 'o3',
    listingId: 'l26',
    buyerId: 'u_me',
    sellerId: 'u_s12',
    status: 'released',
    quote: quote(8000),
    meetupSpot: 'Campus transit center',
    meetupTime: '2026-10-07T23:00:00Z',
    createdAt: '2026-10-07T18:00:00Z',
  },
  {
    id: 'o4',
    listingId: 'l22',
    buyerId: 'u_me',
    sellerId: 'u_s09',
    status: 'released',
    quote: quote(6000),
    meetupSpot: 'Student union lobby',
    meetupTime: '2026-10-01T20:00:00Z',
    createdAt: '2026-10-01T17:00:00Z',
  },
  {
    id: 'o5',
    listingId: 'l14',
    buyerId: 'u_me',
    sellerId: 'u_s04',
    status: 'disputed',
    quote: quote(2500),
    meetupSpot: 'Campus transit center',
    meetupTime: '2026-10-05T21:00:00Z',
    createdAt: '2026-10-05T16:00:00Z',
  },
  {
    id: 'o6',
    listingId: 'l19',
    buyerId: 'u_me',
    sellerId: 'u_s10',
    status: 'cancelled',
    quote: quote(1800),
    createdAt: '2026-10-03T16:00:00Z',
  },
  {
    id: 'o7',
    listingId: 'l09',
    buyerId: 'u_me',
    sellerId: 'u_s03',
    status: 'refunded',
    quote: quote(3500),
    createdAt: '2026-09-28T16:00:00Z',
  },
  {
    id: 'o8',
    listingId: 'l30',
    buyerId: 'u_s05',
    sellerId: 'u_me',
    status: 'released',
    quote: quote(1800),
    meetupSpot: 'Library front steps (daytime)',
    meetupTime: '2026-09-30T20:00:00Z',
    createdAt: '2026-09-30T17:00:00Z',
  },
];

const done = (label: string, at: string): TimelineStep => ({ label, at, state: 'done' });
const cur = (label: string): TimelineStep => ({ label, state: 'current' });
const next = (label: string): TimelineStep => ({ label, state: 'upcoming' });

/** Per-order flags and timeline as the backend would return them. */
export const orderExtras: Record<
  string,
  Pick<OrderDetail, 'timeline' | 'canCancel' | 'canReport' | 'needsRating'>
> = {
  o1: {
    timeline: [
      done('Dibs called, payment held by Dibs Protect', '2026-10-08T18:50:00Z'),
      cur('Meet up and share the handoff code'),
      next('Payment released'),
    ],
    canCancel: true,
    canReport: true,
    needsRating: false,
  },
  o2: {
    timeline: [
      done('Dibs called, payment held by Dibs Protect', '2026-10-08T14:00:00Z'),
      cur('Meet up and enter the buyer’s code'),
      next('Payment released'),
    ],
    canCancel: true,
    canReport: true,
    needsRating: false,
  },
  o3: {
    timeline: [
      done('Dibs called', '2026-10-07T18:00:00Z'),
      done('Handoff code entered', '2026-10-07T23:05:00Z'),
      done('Payment released', '2026-10-07T23:05:00Z'),
    ],
    canCancel: false,
    canReport: true,
    needsRating: true,
  },
  o4: {
    timeline: [
      done('Dibs called', '2026-10-01T17:00:00Z'),
      done('Handoff code entered', '2026-10-01T20:10:00Z'),
      done('Payment released', '2026-10-01T20:10:00Z'),
    ],
    canCancel: false,
    canReport: false,
    needsRating: false,
  },
  o5: {
    timeline: [
      done('Dibs called', '2026-10-05T16:00:00Z'),
      done('Problem reported, payment paused', '2026-10-05T21:20:00Z'),
      cur('Dibs is reviewing'),
    ],
    canCancel: false,
    canReport: false,
    needsRating: false,
  },
  o6: {
    timeline: [
      done('Dibs called', '2026-10-03T16:00:00Z'),
      done('Cancelled by buyer', '2026-10-03T18:00:00Z'),
    ],
    canCancel: false,
    canReport: false,
    needsRating: false,
  },
  o7: {
    timeline: [
      done('Dibs called', '2026-09-28T16:00:00Z'),
      done('Problem reported', '2026-09-28T21:00:00Z'),
      done('Refunded', '2026-09-29T17:00:00Z'),
    ],
    canCancel: false,
    canReport: false,
    needsRating: false,
  },
  o8: {
    timeline: [
      done('Dibs called', '2026-09-30T17:00:00Z'),
      done('Handoff code entered', '2026-09-30T20:05:00Z'),
      done('Payment released', '2026-09-30T20:05:00Z'),
    ],
    canCancel: false,
    canReport: false,
    needsRating: false,
  },
};

export const ratings: Rating[] = [
  { orderId: 'o4', fromId: 'u_me', toId: 'u_s09', stars: 5, tags: ['On time', 'As described'] },
  { orderId: 'o8', fromId: 'u_s05', toId: 'u_me', stars: 5, tags: ['Friendly'] },
];

export const reports: Report[] = [
  { id: 'r1', orderId: 'o5', reason: 'Item is damaged', status: 'open', createdAt: '2026-10-05T21:20:00Z' },
  {
    id: 'r2',
    listingId: 'l37',
    reason: 'Prohibited item',
    status: 'open',
    createdAt: '2026-10-06T16:00:00Z',
  },
  { id: 'r3', listingId: 'l16', reason: 'Something else', status: 'open', createdAt: '2026-10-07T20:00:00Z' },
  {
    id: 'r4',
    orderId: 'o7',
    reason: 'Item is not as described',
    status: 'resolved',
    createdAt: '2026-09-28T21:00:00Z',
  },
];

export const reportSubjects: Record<string, string> = {
  r1: 'Order o5: 5-shelf bookcase',
  r2: 'Listing: Space heater',
  r3: 'Listing: 2-seat sofa',
  r4: 'Order o7: Mechanical keyboard',
};

/** The demo Hold to Dibs result: a new held order with a fixture handoff code. */
export const newHeldOrder = (listingId: string, sellerId: string, priceCents: number): Order => ({
  id: 'o_new',
  listingId,
  buyerId: 'u_me',
  sellerId,
  status: 'held',
  quote: quote(priceCents),
  handoffCodeVisibleToBuyer: '7316',
  createdAt: '2026-10-08T19:00:00Z',
});
