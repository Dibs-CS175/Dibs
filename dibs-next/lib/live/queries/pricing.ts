'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/queries/pricing.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { now } from '@/lib/clock';
import rawTables from '@/lib/fixtures/priceTable.json';
import { notImplemented } from '@/lib/live/not-implemented';
import { getSession } from '@/lib/live/queries/users';
import {
  currentTier,
  PricingError,
  sellerPayout,
  summerHoldLines,
  summerHoldTeaser,
  type Line,
  type PriceRow,
} from '@/lib/pricing';
import { fail, ok, type Result } from '@/lib/result';
import type {
  AddOnKey,
  Quote,
  QuoteLineKind,
  SummerHoldInput,
  SummerHoldOffers,
  SummerHoldTeaser,
} from '@/lib/types';

// The fixture stands in for Brian's price table until it is seeded
const tables = rawTables as PriceRow[];

const NO_PRICES = 'No prices for this campus yet.';

// The campus price row for asOf: the season (startsAt to endsAt) that covers it, else the next one to start,
// else the last one that ended. Null only when the campus has no rows
// Never null between seasons, so marketplace fees work year-round; Summer Hold still closes by its tier dates
function priceRow(campusId: string, asOf: Date): PriceRow | null {
  const t = asOf.getTime();
  const rows = tables
    .filter((r) => r.campusId === campusId)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  return (
    rows.find((r) => Date.parse(r.startsAt) <= t && t <= Date.parse(r.endsAt)) ??
    rows.find((r) => Date.parse(r.startsAt) > t) ??
    rows.at(-1) ??
    null
  );
}

// Turns anything lib/pricing throws into the Result failure the screens expect, so nothing throws to a screen
function toFail(e: unknown): Result<never> {
  if (e instanceof PricingError) return fail(e.code, e.message);
  return fail('UNKNOWN', 'Something went wrong. Try again.');
}

// lib/pricing lines carry a key; screens group quote lines by kind
function kindOf(key: string): QuoteLineKind {
  if (key === 'standard_items' || key === 'large_items') return 'item';
  if (key === 'registration' || key === 'off_campus') return 'fee';
  return 'addon';
}

function toQuote(lines: Line[], totalCents: number): Quote {
  return { lines: lines.map((l) => ({ label: l.label, kind: kindOf(l.key), cents: l.cents })), totalCents };
}

/** Item price, buyer fee, sales tax and the all-in total for Hold to Dibs. */
export async function getCheckoutQuote(listingId: string): Promise<Result<Quote>> {
  // Needs the listing's price and campus from Brian's listings table; checkoutLines in lib/pricing is ready
  // STUB(pricing): replace with real implementation
  return notImplemented('getCheckoutQuote', 'lib/live/queries/pricing.ts');
}

/** Asking price, seller fee and what the seller receives. */
export async function getSellerPayoutQuote(priceCents: number): Promise<Result<Quote>> {
  try {
    // 0 is allowed: the sell screen asks for a payout quote on free items too
    if (!Number.isInteger(priceCents) || priceCents < 0) {
      return fail('VALIDATION', 'Enter a price of $0 or more.');
    }
    // The seller's campus comes from the session; this fails with NOT_IMPLEMENTED until getSession is built
    const session = await getSession();
    if (!session.ok) return session;
    if (!session.data) return fail('NOT_SIGNED_IN', 'Sign in to see your payout.');
    const row = priceRow(session.data.campus.id, now());
    if (!row) return fail('NOT_FOUND', NO_PRICES);
    const payoutCents = sellerPayout(priceCents, row);
    return ok({
      lines: [
        { label: 'Asking price', kind: 'item', cents: priceCents },
        { label: 'Seller fee', kind: 'fee', cents: -(priceCents - payoutCents) },
      ],
      totalCents: payoutCents,
    });
  } catch (e) {
    return toFail(e);
  }
}

/** Items, registration, Full Service, add-ons, referral credit and the all-in total. */
export async function getSummerHoldQuote(input: SummerHoldInput): Promise<Result<Quote>> {
  try {
    const asOf = now();
    const row = priceRow(input.campusId, asOf);
    if (!row) return fail('NOT_FOUND', NO_PRICES);
    // Referral credit is not priced yet, so input.referralCode does not change the quote
    const q = summerHoldLines(
      row,
      {
        standardCount: input.standardCount,
        largeCount: input.largeCount,
        addOnKeys: input.addOnKeys,
        offCampus: input.housingType === 'off_campus',
        fullService: input.fullService,
      },
      asOf,
    );
    return ok(toQuote(q.lines, q.totalCents));
  } catch (e) {
    return toFail(e);
  }
}

/**
 * The advertised all-in line, e.g. "4 items from $X". The total includes every mandatory fee.
 * Null when Summer Hold is not offered at the campus yet.
 */
export async function getSummerHoldTeaser(campusId: string): Promise<Result<SummerHoldTeaser | null>> {
  try {
    const asOf = now();
    const row = priceRow(campusId, asOf);
    if (!row) return ok(null);
    // Null once registration has closed too, so the screens hide the teaser instead of showing an error
    const totalCents = summerHoldTeaser(row, asOf);
    return ok(totalCents === null ? null : { itemCount: 4, totalCents });
  } catch (e) {
    return toFail(e);
  }
}

/** The campus offer: current registration tier, item prices, box rule, Full Service, add-ons, coverage. */
export async function getSummerHoldOffers(campusId: string): Promise<Result<SummerHoldOffers>> {
  try {
    const asOf = now();
    const row = priceRow(campusId, asOf);
    if (!row) return fail('NOT_FOUND', NO_PRICES);
    const tier = currentTier(row, asOf);
    if (!tier) return fail('DEADLINE_PASSED', 'Summer Hold registration has closed.');
    return ok({
      campusId: row.campusId,
      currentTier: tier,
      itemStandardCents: row.itemStandardCents,
      itemLargeCents: row.itemLargeCents,
      standardBoxRule: row.standardBoxRule,
      fullService: row.fullService,
      addOns: row.addOns.map((a) => ({
        key: a.key as AddOnKey,
        label: a.label,
        cents: a.cents,
        note: a.note,
      })),
      coveragePerItemCents: row.coveragePerItemCents,
      cancelWindowDays: row.cancelWindowDays,
      balanceDueDate: row.balanceDueDate,
    });
  } catch (e) {
    return toFail(e);
  }
}
