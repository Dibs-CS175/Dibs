import { describe, it, expect } from 'vitest';
import table from '../fixtures/priceTable.json';
import { applyBps, checkoutLines, currentTier, PricingError, sellerPayout, type PriceRow } from './index';

const rows = table as PriceRow[];
const ucr = rows.find((r) => r.campusId === 'riverside')!;
const at = (iso: string) => new Date(iso);

describe('applyBps', () => {
  it.each([
    [360, 875, 32],
    [2600, 875, 228],
    [2175, 875, 190],
    [2000, 500, 100],
  ])('%i cents at %i bps rounds to %i', (amount, bps, expected) => {
    expect(applyBps(amount, bps)).toBe(expected);
  });

  it('rejects a negative amount', () => {
    expect(() => applyBps(-100, 875)).toThrow(PricingError);
  });
});

describe('marketplace checkout', () => {
  it('prices a $20 item all-in', () => {
    const q = checkoutLines(2000, ucr);
    expect(q.buyerFeeCents).toBe(175);
    expect(q.taxCents).toBe(190);
    expect(q.totalCents).toBe(2365);
  });

  it('total equals the sum of its lines', () => {
    const q = checkoutLines(2000, ucr);
    expect(q.lines.reduce((s, l) => s + l.cents, 0)).toBe(q.totalCents);
  });

  it('pays the seller $19.00 on a $20 item', () => {
    expect(sellerPayout(2000, ucr)).toBe(1900);
  });
});

describe('registration tiers', () => {
  it.each([
    ['2027-04-15T23:59:59-07:00', 'early'],
    ['2027-04-16T00:00:00-07:00', 'standard'],
    ['2027-05-27T23:59:59-07:00', 'standard'],
    ['2027-05-28T00:00:00-07:00', 'final'],
  ])('%s is the %s tier', (iso, key) => {
    expect(currentTier(ucr, at(iso))?.key).toBe(key);
  });

  it('is closed after the final tier', () => {
    expect(currentTier(ucr, at('2027-06-07T00:00:00-07:00'))).toBeNull();
  });
});
