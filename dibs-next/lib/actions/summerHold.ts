import { simulate } from '@/lib/dev';
import { bookings, myBookingFixture, pickupSlots, returnSlots } from '@/lib/fixtures/summerHold';
import type { Result } from '@/lib/result';
import type { HousingType, MyBooking, StorageItemInput, SummerHoldBooking } from '@/lib/types';

export interface BookingDraftInput {
  housingType: HousingType;
  address: string;
  items: StorageItemInput[];
}

export async function createBooking(input: BookingDraftInput): Promise<Result<SummerHoldBooking>> {
  // STUB(summerHold): replace with real implementation
  return simulate<SummerHoldBooking>({
    ...bookings[2]!,
    id: 'bk_new',
    userId: 'u_me',
    status: 'draft',
    housingType: input.housingType,
    address: input.address,
    items: input.items.map((i, n) => ({
      id: `new_i${n}`,
      bookingId: 'bk_new',
      label: i.label,
      size: i.size,
      status: 'pending',
    })),
  });
}

/** Errors: SLOT_FULL. */
export async function choosePickupSlot(
  bookingId: string,
  slotId: string,
): Promise<Result<SummerHoldBooking>> {
  // STUB(summerHold): replace with real implementation
  return simulate<SummerHoldBooking>({ ...bookings[2]!, id: bookingId, pickupSlotId: slotId });
}

/** Takes the deposit and holds it with Dibs Protect. Errors: PAYMENT_FAILED. */
export async function payDeposit(bookingId: string): Promise<Result<SummerHoldBooking>> {
  // STUB(summerHold): replace with real implementation
  return simulate<SummerHoldBooking>({ ...bookings[0]!, id: bookingId, status: 'deposit_paid' });
}

/** Errors: DEADLINE_PASSED. */
export async function updateBookingItems(
  bookingId: string,
  items: StorageItemInput[],
): Promise<Result<MyBooking>> {
  // STUB(summerHold): replace with real implementation
  return simulate<MyBooking>({
    ...myBookingFixture,
    booking: {
      ...myBookingFixture.booking,
      id: bookingId,
      items: items.map((i, n) => ({
        id: `si_e${n}`,
        bookingId,
        label: i.label,
        size: i.size,
        status: 'pending',
      })),
    },
  });
}

/** Errors: SLOT_FULL. */
export async function chooseReturnSlot(bookingId: string, slotId: string): Promise<Result<MyBooking>> {
  // STUB(summerHold): replace with real implementation
  return simulate<MyBooking>({
    ...myBookingFixture,
    booking: { ...myBookingFixture.booking, id: bookingId, returnSlotId: slotId },
    returnSlot: returnSlots.find((s) => s.id === slotId) ?? null,
  });
}

/** Errors: PAYMENT_FAILED, DEADLINE_PASSED. */
export async function payBalance(bookingId: string): Promise<Result<MyBooking>> {
  // STUB(summerHold): replace with real implementation
  return simulate<MyBooking>({
    ...myBookingFixture,
    booking: { ...myBookingFixture.booking, id: bookingId, status: 'paid' },
    canPayBalance: false,
  });
}

export async function cancelBooking(bookingId: string): Promise<Result<MyBooking>> {
  // STUB(summerHold): replace with real implementation
  return simulate<MyBooking>({
    ...myBookingFixture,
    booking: { ...myBookingFixture.booking, id: bookingId, status: 'cancelled' },
    pickupSlot: pickupSlots[2] ?? null,
    canEditItems: false,
    canPayBalance: false,
    canCancel: false,
  });
}
