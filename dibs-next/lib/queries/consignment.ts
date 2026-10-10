import { simulate } from '@/lib/dev';
import {
  adminConsignments,
  consignmentTerms,
  myConsignments,
  myPayoutMethod,
  storagePickupSlots,
} from '@/lib/fixtures/consignment';
import type { Result } from '@/lib/result';
import type {
  ConsignmentAdminView,
  ConsignmentStatus,
  ConsignmentTerms,
  ConsignmentView,
  PayoutMethod,
  SlotView,
} from '@/lib/types';

/** Commission, minimum price, unsold and damage policy for the current summer. */
export async function getConsignmentTerms(): Promise<Result<ConsignmentTerms>> {
  // STUB(consignment): replace with real implementation
  return simulate(consignmentTerms);
}

/** The signed-in student's items marked to sell, across all summers. */
export async function getMyConsignments(): Promise<Result<ConsignmentView[]>> {
  // STUB(consignment): replace with real implementation
  return simulate(myConsignments, []);
}

export async function getMyPayoutMethod(): Promise<Result<PayoutMethod>> {
  // STUB(consignment): replace with real implementation
  return simulate<PayoutMethod>(myPayoutMethod, { status: 'not_set', label: null });
}

/** Windows when buyers collect consigned items at the storage unit. `isFull` comes from the backend. */
export async function getStoragePickupSlots(): Promise<Result<SlotView[]>> {
  // STUB(consignment): replace with real implementation
  return simulate(storagePickupSlots, []);
}

/** Admin: consigned items, optionally filtered by status on the backend. */
export async function getConsignmentQueue(
  status?: ConsignmentStatus,
): Promise<Result<ConsignmentAdminView[]>> {
  // STUB(consignment): replace with real implementation
  return simulate(status ? adminConsignments.filter((c) => c.status === status) : adminConsignments, []);
}

/** Admin: items with a payout owed or sent. */
export async function getPayouts(): Promise<Result<ConsignmentAdminView[]>> {
  // STUB(consignment): replace with real implementation
  return simulate(
    adminConsignments.filter((c) => c.payout !== null && c.status !== 'sold'),
    [],
  );
}
