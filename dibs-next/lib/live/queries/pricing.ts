'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/queries/pricing.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { notImplemented } from '@/lib/live/not-implemented';
import type { Result } from '@/lib/result';
import type { Quote, SummerHoldInput, SummerHoldOffers, SummerHoldTeaser } from '@/lib/types';

/** Item price, buyer fee, sales tax and the all-in total for Hold to Dibs. */
export async function getCheckoutQuote(listingId: string): Promise<Result<Quote>> {
  // STUB(pricing): replace with real implementation
  return notImplemented('getCheckoutQuote', 'lib/live/queries/pricing.ts');
}

/** Asking price, seller fee and what the seller receives. */
export async function getSellerPayoutQuote(priceCents: number): Promise<Result<Quote>> {
  // STUB(pricing): replace with real implementation
  return notImplemented('getSellerPayoutQuote', 'lib/live/queries/pricing.ts');
}

/** Items, registration, Full Service, add-ons, referral credit and the all-in total. */
export async function getSummerHoldQuote(input: SummerHoldInput): Promise<Result<Quote>> {
  // STUB(pricing): replace with real implementation
  return notImplemented('getSummerHoldQuote', 'lib/live/queries/pricing.ts');
}

/**
 * The advertised all-in line, e.g. "4 items from $X". The total includes every mandatory fee.
 * Null when Summer Hold is not offered at the campus yet.
 */
export async function getSummerHoldTeaser(campusId: string): Promise<Result<SummerHoldTeaser | null>> {
  // STUB(pricing): replace with real implementation
  return notImplemented('getSummerHoldTeaser', 'lib/live/queries/pricing.ts');
}

/** The campus offer: current registration tier, item prices, box rule, Full Service, add-ons, coverage. */
export async function getSummerHoldOffers(campusId: string): Promise<Result<SummerHoldOffers>> {
  // STUB(pricing): replace with real implementation
  return notImplemented('getSummerHoldOffers', 'lib/live/queries/pricing.ts');
}
