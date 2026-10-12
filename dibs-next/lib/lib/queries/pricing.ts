import { currentCampusId, simulate } from '@/lib/dev';
import rawTables from '@/lib/fixtures/priceTable.json';
import { listings } from '@/lib/fixtures/listings';
import type { Result } from '@/lib/result';
import type {
  Listing,
  PriceTable,
  Quote,
  SummerHoldInput,
  SummerHoldOffers,
  SummerHoldTeaser,
} from '@/lib/types';

/*
 * The price table is read here and nowhere else. Other stubs that need a quote or a business date call
 * the `stub…` helpers below, so every value still traces back to lib/fixtures/priceTable.json.
 *
 * Totals: the stubs never add lines up. Every total is 0 until the backend computes it, which matches
 * the placeholder table. Line amounts that depend on a count or a rate (items × price, a percentage fee,
 * tax) are also left at 0 for the backend; flat amounts are copied from the table as they are.
 */

// JSON imports widen tuples to arrays; the table's shape is checked by hand when the team edits it.
const tables = rawTables as unknown as PriceTable[];

/** Stub helper: the price table row for a campus. */
export function stubPriceTable(campusId: string): PriceTable {
  return tables.find((t) => t.campusId === campusId) ?? tables[0]!;
}

/** Stub helper: checkout quote lines for a listing. */
export function stubCheckoutQuote(listing: Listing): Quote {
  const t = stubPriceTable(listing.campusId);
  return {
    lines: [
      { label: 'Item', kind: 'item', cents: listing.priceCents },
      { label: 'Buyer fee', kind: 'fee', cents: t.marketplace.buyerFlatCents },
      { label: 'Sales tax', kind: 'tax', cents: 0 },
    ],
    totalCents: 0,
  };
}

/** Stub helper: payout quote lines for a seller's asking price. */
export function stubPayoutQuote(campusId: string, priceCents: number): Quote {
  void stubPriceTable(campusId);
  return {
    lines: [
      { label: 'Asking price', kind: 'item', cents: priceCents },
      { label: 'Seller fee', kind: 'fee', cents: 0 },
    ],
    totalCents: 0,
  };
}

/** Stub helper: Summer Hold quote lines from the choices made. No tax line on Summer Hold. */
export function stubSummerHoldQuote(
  input: Omit<SummerHoldInput, 'housingType'> & { tierKey?: string },
): Quote {
  const t = stubPriceTable(input.campusId);
  const tier = t.registrationTiers.find((x) => x.key === input.tierKey) ?? t.registrationTiers[0]!;
  return {
    lines: [
      ...(input.standardCount
        ? [{ label: `Standard items × ${input.standardCount}`, kind: 'item' as const, cents: 0 }]
        : []),
      ...(input.largeCount
        ? [{ label: `Large items × ${input.largeCount}`, kind: 'item' as const, cents: 0 }]
        : []),
      { label: tier.label, kind: 'fee', cents: tier.cents },
      ...(input.fullService
        ? [{ label: 'Full Service', kind: 'addon' as const, cents: t.fullService.cents }]
        : []),
      ...t.addOns
        .filter((a) => input.addOnKeys.includes(a.key))
        .map((a) => ({ label: a.label, kind: 'addon' as const, cents: a.cents })),
      ...(input.referralCode ? [{ label: 'Referral credit', kind: 'credit' as const, cents: 0 }] : []),
    ],
    totalCents: 0,
  };
}

/** Stub helper: business dates for a booking. Both stay null until the table has them. */
export function stubBookingDates(campusId: string): {
  balanceDueAt: string | null;
  freeCancelUntil: string | null;
} {
  return { balanceDueAt: stubPriceTable(campusId).balanceDueDate, freeCancelUntil: null };
}

/** Item price, buyer fee, sales tax and the all-in total for Hold to Dibs. */
export async function getCheckoutQuote(listingId: string): Promise<Result<Quote>> {
  // STUB(pricing): replace with real implementation
  const l = listings.find((x) => x.id === listingId) ?? listings[1]!;
  return simulate(stubCheckoutQuote(l));
}

/** Asking price, seller fee and what the seller receives. */
export async function getSellerPayoutQuote(priceCents: number): Promise<Result<Quote>> {
  // STUB(pricing): replace with real implementation
  return simulate(stubPayoutQuote(currentCampusId(), priceCents));
}

/** Items, registration, Full Service, add-ons, referral credit and the all-in total. */
export async function getSummerHoldQuote(input: SummerHoldInput): Promise<Result<Quote>> {
  // STUB(pricing): replace with real implementation
  return simulate(stubSummerHoldQuote(input));
}

/**
 * The advertised all-in line, e.g. "4 items from $X". The total includes every mandatory fee.
 * Null when Summer Hold is not offered at the campus yet.
 */
export async function getSummerHoldTeaser(campusId: string): Promise<Result<SummerHoldTeaser | null>> {
  // STUB(pricing): replace with real implementation
  void stubPriceTable(campusId);
  return simulate<SummerHoldTeaser | null>({ itemCount: 4, totalCents: 0 }, null);
}

/** The campus offer: current registration tier, item prices, box rule, Full Service, add-ons, coverage. */
export async function getSummerHoldOffers(campusId: string): Promise<Result<SummerHoldOffers>> {
  // STUB(pricing): replace with real implementation
  const t = stubPriceTable(campusId);
  return simulate<SummerHoldOffers>({
    campusId: t.campusId,
    // The backend picks the tier in effect by date. The stub returns the first one.
    currentTier: t.registrationTiers[0]!,
    itemStandardCents: t.itemStandardCents,
    itemLargeCents: t.itemLargeCents,
    standardBoxRule: t.standardBoxRule,
    fullService: t.fullService,
    addOns: t.addOns,
    coveragePerItemCents: t.coveragePerItemCents,
    cancelWindowDays: t.cancelWindowDays,
    balanceDueDate: t.balanceDueDate,
  });
}
