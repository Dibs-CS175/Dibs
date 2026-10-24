// Integer-cent rate math. Rates are in basis points: 875 = 8.75%, 500 = 5%.
import { PricingError } from './types';

/**
 * Returns amountCents x bps / 10000, rounded to the nearest cent, halves rounding up
 * Non-negative integer amounts only. For a refund, call it on the positive amount and negate the result
 */
export function applyBps(amountCents: number, bps: number): number {
  if (!Number.isInteger(amountCents) || amountCents < 0) {
    throw new PricingError(
      'VALIDATION',
      `Amount must be a whole, non-negative number of cents: ${amountCents}`,
    );
  }
  // Multiply first, then divide: amountCents * bps is an exact integer, so only the final round can move a cent
  // Never multiply by a fraction like 0.0875; that is what breaks the $3.60 and $26.00 cases.
  return Math.round((amountCents * bps) / 10000);
}

/** Converts a whole-number percent from the price table (5) to basis points (500). */
export function pctToBps(pct: number): number {
  return pct * 100;
}
