import { describe, it, expect } from 'vitest';
import { applyBps, PricingError } from './index';

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
