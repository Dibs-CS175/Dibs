import type { SlotView, SummerHoldBooking } from '@/lib/types';

/**
 * Bookings without their quote and business dates. The Summer Hold stubs attach `quote`,
 * `balanceDueAt` and `freeCancelUntil` from the pricing stub helpers, which read the price table.
 */
export type BookingRecord = Omit<SummerHoldBooking, 'quote' | 'balanceDueAt' | 'freeCancelUntil'>;

export const bookingRecords: BookingRecord[] = [
  {
    // Full Service, with a packing appointment.
    id: 'bk1',
    campusId: 'riverside',
    userId: 'u_me',
    status: 'registered',
    housingType: 'hall',
    address: 'Hilltop Halls, Pine Building, room 214',
    standardCount: 3,
    largeCount: 1,
    registrationTierKey: 'early',
    fullService: true,
    packingSlotId: 'pk3',
    addOnKeys: [],
    registeredAt: '2026-10-02T18:00:00Z',
  },
  {
    // Add-ons.
    id: 'bk2',
    campusId: 'riverside',
    userId: 'u_s05',
    status: 'balance_paid',
    housingType: 'campus_apartment',
    address: 'North Apartments, building C, unit 4B',
    standardCount: 5,
    largeCount: 2,
    registrationTierKey: 'early',
    fullService: false,
    addOnKeys: ['protect_plus', 'delivery'],
    registeredAt: '2026-09-25T18:00:00Z',
  },
  {
    // Referral code and a parent pay link, not yet paid.
    id: 'bk3',
    campusId: 'riverside',
    userId: 'u_s09',
    status: 'draft',
    housingType: 'off_campus',
    address: '2215 Sycamore Ridge Rd, apt 7',
    standardCount: 2,
    largeCount: 0,
    registrationTierKey: 'standard',
    fullService: false,
    addOnKeys: ['priority_window'],
    referralCode: 'ALEX-7KD2',
    parentPayToken: 'demo-parent-7Hq2',
  },
];

const slot = (
  id: string,
  campusId: string,
  kind: 'packing' | 'pickup',
  startsAt: string,
  endsAt: string,
  capacity: number,
  booked: number,
  isFull: boolean,
): SlotView => ({ id, campusId, kind, startsAt, endsAt, capacity, booked, isFull });

/** Full Service packing appointments, the week before move-out. `isFull` is decided by the backend. */
export const packingSlots: SlotView[] = [
  slot('pk1', 'riverside', 'packing', '2027-06-03T16:00:00Z', '2027-06-03T18:00:00Z', 4, 4, true),
  slot('pk2', 'riverside', 'packing', '2027-06-03T20:00:00Z', '2027-06-03T22:00:00Z', 4, 1, false),
  slot('pk3', 'riverside', 'packing', '2027-06-04T16:00:00Z', '2027-06-04T18:00:00Z', 4, 2, false),
  slot('pk4', 'riverside', 'packing', '2027-06-04T20:00:00Z', '2027-06-04T22:00:00Z', 4, 4, true),
  slot('pk5', 'riverside', 'packing', '2027-06-05T16:00:00Z', '2027-06-05T18:00:00Z', 4, 0, false),
  slot('pk6', 'riverside', 'packing', '2027-06-05T20:00:00Z', '2027-06-05T22:00:00Z', 4, 3, false),
  slot('pk7', 'san-bernardino', 'packing', '2027-06-03T16:00:00Z', '2027-06-03T18:00:00Z', 3, 1, false),
  slot('pk8', 'san-bernardino', 'packing', '2027-06-04T16:00:00Z', '2027-06-04T18:00:00Z', 3, 3, true),
];

/** Move-out pickup windows. */
export const pickupSlots: SlotView[] = [
  slot('pu1', 'riverside', 'pickup', '2027-06-07T16:00:00Z', '2027-06-07T18:00:00Z', 12, 12, true),
  slot('pu2', 'riverside', 'pickup', '2027-06-07T20:00:00Z', '2027-06-07T22:00:00Z', 12, 7, false),
  slot('pu3', 'riverside', 'pickup', '2027-06-08T16:00:00Z', '2027-06-08T18:00:00Z', 12, 4, false),
  slot('pu4', 'riverside', 'pickup', '2027-06-08T20:00:00Z', '2027-06-08T22:00:00Z', 12, 12, true),
  slot('pu5', 'riverside', 'pickup', '2027-06-09T16:00:00Z', '2027-06-09T18:00:00Z', 12, 9, false),
  slot('pu6', 'riverside', 'pickup', '2027-06-10T16:00:00Z', '2027-06-10T18:00:00Z', 12, 2, false),
  slot('pu7', 'riverside', 'pickup', '2027-06-11T16:00:00Z', '2027-06-11T18:00:00Z', 12, 12, true),
  slot('pu8', 'riverside', 'pickup', '2027-06-12T16:00:00Z', '2027-06-12T18:00:00Z', 12, 5, false),
  slot('pu9', 'san-bernardino', 'pickup', '2027-06-08T16:00:00Z', '2027-06-08T18:00:00Z', 8, 2, false),
  slot('pu10', 'san-bernardino', 'pickup', '2027-06-09T16:00:00Z', '2027-06-09T18:00:00Z', 8, 8, true),
];
