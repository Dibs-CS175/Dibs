import { simulate } from '@/lib/dev';
import { adminConsignments, myConsignments, storagePickupSlots } from '@/lib/fixtures/consignment';
import { listings } from '@/lib/fixtures/listings';
import type { Result } from '@/lib/result';
import type {
  ConsignedListingInput,
  ConsignmentAdminView,
  ConsignmentView,
  DamageCause,
  Listing,
  PayoutMethod,
  SlotView,
} from '@/lib/types';

const mine = (itemId: string) => myConsignments.find((c) => c.item.id === itemId) ?? myConsignments[2]!;
const admin = (itemId: string) =>
  adminConsignments.find((c) => c.item.id === itemId) ?? adminConsignments[1]!;

/** Errors: VALIDATION (under the minimum), CONFLICT (already sold), DEADLINE_PASSED (listing period over). */
export async function updateConsignmentPrice(
  itemId: string,
  askingPriceCents: number,
): Promise<Result<ConsignmentView>> {
  // STUB(consignment): replace with real implementation
  const c = mine(itemId);
  return simulate<ConsignmentView>({ ...c, item: { ...c.item, askingPriceCents } });
}

/** Takes the item off sale; it goes back with the fall return. Errors: CONFLICT (already sold). */
export async function withdrawConsignment(itemId: string): Promise<Result<ConsignmentView>> {
  // STUB(consignment): replace with real implementation
  const c = mine(itemId);
  return simulate<ConsignmentView>({
    ...c,
    item: { ...c.item, disposition: 'return' },
    status: 'withdrawn',
    listing: null,
    canEditPrice: false,
    canWithdraw: false,
  });
}

/** Hands off to the payment provider's onboarding. The stub returns a connected account. */
export async function startPayoutSetup(): Promise<Result<PayoutMethod>> {
  // STUB(consignment): replace with real implementation
  return simulate<PayoutMethod>({ status: 'set', label: 'Bank account ending 4417' });
}

/** Buyer of a consigned item picks a collection window. Errors: SLOT_FULL. */
export async function chooseStoragePickupSlot(
  orderId: string,
  slotId: string,
): Promise<Result<{ orderId: string; slot: SlotView }>> {
  // STUB(consignment): replace with real implementation
  return simulate({
    orderId,
    slot: storagePickupSlots.find((s) => s.id === slotId) ?? storagePickupSlots[1]!,
  });
}

/** Admin: creates the listing for a checked-in sell item. Dibs is the seller of record. */
export async function publishConsignedListing(
  itemId: string,
  input: ConsignedListingInput,
): Promise<Result<Listing>> {
  // STUB(consignment): replace with real implementation
  const c = admin(itemId);
  return simulate<Listing>({
    ...listings.find((l) => l.id === 'l41')!,
    id: 'l_consigned_new',
    title: input.title,
    description: input.description,
    category: input.category || 'other',
    condition: input.condition || 'good',
    housingFit: input.housingFit || 'apartment',
    priceCents: c.item.askingPriceCents ?? 0,
    status: 'active',
  });
}

/** Admin: records damage and its cause. The backend decides the outcome (payout, completed sale or claim). */
export async function recordConsignmentDamage(
  itemId: string,
  cause: DamageCause,
  note: string,
): Promise<Result<ConsignmentAdminView>> {
  // STUB(consignment): replace with real implementation
  void cause;
  const c = admin(itemId);
  return simulate<ConsignmentAdminView>({
    ...c,
    item: { ...c.item, status: 'damaged', conditionNote: note },
    status: 'damaged',
    canEditPrice: false,
    canWithdraw: false,
  });
}

/** Admin: moves an unsold item into Dibs Goods. No payout is owed. Errors: CONFLICT (still inside its listing period). */
export async function moveUnsoldToGoods(itemId: string): Promise<Result<ConsignmentAdminView>> {
  // STUB(consignment): replace with real implementation
  const c = admin(itemId);
  return simulate<ConsignmentAdminView>({
    ...c,
    status: 'unsold_to_goods',
    listing: null,
    canEditPrice: false,
    canWithdraw: false,
  });
}

/** Admin: records that the payout went out. Errors: CONFLICT (owner has no payout method). */
export async function markPayoutSent(itemId: string): Promise<Result<ConsignmentAdminView>> {
  // STUB(consignment): replace with real implementation
  const c = admin(itemId);
  return simulate<ConsignmentAdminView>({ ...c, status: 'paid_out', payoutSentAt: '2026-10-09T18:00:00Z' });
}
