import {
  SUMMER_HOLD_DEPOSIT_CENTS,
  SUMMER_HOLD_LARGE_ITEM_CENTS,
  SUMMER_HOLD_STANDARD_ITEM_CENTS,
} from '@/lib/config/pricing';
import type { MyBooking, Quote, SlotView, StorageItem, SummerHoldBooking } from '@/lib/types';

/** Times are UTC. Pickup week is the week of move-out; return week is the week before fall classes. */
const slot = (
  id: string,
  kind: 'pickup' | 'return',
  startsAt: string,
  endsAt: string,
  capacity: number,
  booked: number,
  isFull: boolean,
): SlotView => ({
  id,
  kind,
  startsAt,
  endsAt,
  capacity,
  booked,
  isFull,
});

export const pickupSlots: SlotView[] = [
  slot('ps1', 'pickup', '2027-06-07T16:00:00Z', '2027-06-07T18:00:00Z', 12, 12, true),
  slot('ps2', 'pickup', '2027-06-07T20:00:00Z', '2027-06-07T22:00:00Z', 12, 7, false),
  slot('ps3', 'pickup', '2027-06-08T16:00:00Z', '2027-06-08T18:00:00Z', 12, 4, false),
  slot('ps4', 'pickup', '2027-06-08T20:00:00Z', '2027-06-08T22:00:00Z', 12, 12, true),
  slot('ps5', 'pickup', '2027-06-09T16:00:00Z', '2027-06-09T18:00:00Z', 12, 9, false),
  slot('ps6', 'pickup', '2027-06-09T20:00:00Z', '2027-06-09T22:00:00Z', 12, 2, false),
  slot('ps7', 'pickup', '2027-06-10T16:00:00Z', '2027-06-10T18:00:00Z', 12, 12, true),
  slot('ps8', 'pickup', '2027-06-10T20:00:00Z', '2027-06-10T22:00:00Z', 12, 11, false),
  slot('ps9', 'pickup', '2027-06-11T16:00:00Z', '2027-06-11T18:00:00Z', 12, 5, false),
  slot('ps10', 'pickup', '2027-06-11T20:00:00Z', '2027-06-11T22:00:00Z', 12, 12, true),
];

export const returnSlots: SlotView[] = [
  slot('rs1', 'return', '2027-09-20T16:00:00Z', '2027-09-20T18:00:00Z', 10, 10, true),
  slot('rs2', 'return', '2027-09-20T20:00:00Z', '2027-09-20T22:00:00Z', 10, 3, false),
  slot('rs3', 'return', '2027-09-21T16:00:00Z', '2027-09-21T18:00:00Z', 10, 6, false),
  slot('rs4', 'return', '2027-09-21T20:00:00Z', '2027-09-21T22:00:00Z', 10, 10, true),
  slot('rs5', 'return', '2027-09-22T16:00:00Z', '2027-09-22T18:00:00Z', 10, 1, false),
  slot('rs6', 'return', '2027-09-22T20:00:00Z', '2027-09-22T22:00:00Z', 10, 4, false),
];

const item = (
  id: string,
  bookingId: string,
  label: string,
  size: StorageItem['size'],
  status: StorageItem['status'],
  extra: Partial<StorageItem> = {},
): StorageItem => ({
  id,
  bookingId,
  label,
  size,
  disposition: 'return',
  status,
  ...extra,
});

/** Quote lines come from the pricing placeholders. The fixture total is 0 because every placeholder is 0. */
const holdQuote = (standard: number, large: number): Quote => ({
  lines: [
    ...Array.from({ length: standard }, () => ({
      label: 'Standard item',
      cents: SUMMER_HOLD_STANDARD_ITEM_CENTS,
    })),
    ...Array.from({ length: large }, () => ({ label: 'Large item', cents: SUMMER_HOLD_LARGE_ITEM_CENTS })),
    { label: 'Deposit due today', cents: SUMMER_HOLD_DEPOSIT_CENTS },
  ],
  totalCents: 0,
});

export const bookings: SummerHoldBooking[] = [
  {
    id: 'bk1',
    userId: 'u_me',
    status: 'deposit_paid',
    housingType: 'hall',
    address: 'Hilltop Halls, Pine Building, room 214',
    items: [
      item('si1', 'bk1', 'Mini storage tower', 'standard', 'pending'),
      item('si2', 'bk1', 'Box of books', 'standard', 'pending'),
      item('si3', 'bk1', 'Road bike', 'large', 'pending', {
        disposition: 'sell',
        askingPriceCents: 12000,
        consignmentStatus: 'awaiting_checkin',
      }),
    ],
    pickupSlotId: 'ps3',
    quote: holdQuote(2, 1),
    balanceDueAt: '2027-06-01T06:59:00Z',
  },
  {
    id: 'bk2',
    userId: 'u_s05',
    status: 'stored',
    housingType: 'hall',
    address: 'Hilltop Halls, Cedar Building, room 108',
    items: [
      item('si4', 'bk2', 'Desk lamp', 'standard', 'stored', { binId: 'b1', conditionNote: 'No marks.' }),
      item('si5', 'bk2', 'Clip fan', 'standard', 'stored', { binId: 'b1' }),
    ],
    pickupSlotId: 'ps2',
    returnSlotId: 'rs3',
    quote: holdQuote(2, 0),
    balanceDueAt: '2027-06-01T06:59:00Z',
  },
  {
    id: 'bk3',
    userId: 'u_s09',
    status: 'draft',
    housingType: 'campus_apartment',
    address: 'North Apartments, building C, unit 4B',
    items: [item('si6', 'bk3', 'Futon frame', 'large', 'pending')],
    quote: holdQuote(0, 1),
    balanceDueAt: '2027-06-01T06:59:00Z',
  },
];

export const myBookingFixture: MyBooking = {
  booking: bookings[0]!,
  pickupSlot: pickupSlots[2] ?? null,
  returnSlot: null,
  canEditItems: true,
  itemEditDeadline: '2027-06-01T06:59:00Z',
  canPayBalance: true,
  canCancel: true,
};
