import { describe, expect, it } from 'vitest';
import { LIVE_FEATURES, isFeatureOn, type Feature } from './features';

const FEATURES = Object.keys(LIVE_FEATURES) as Feature[];

describe('isFeatureOn', () => {
  it('shows every feature on Demo data', () => {
    for (const f of FEATURES) expect(isFeatureOn(f, 'demo')).toBe(true);
  });

  it('follows the flag on Live data', () => {
    for (const f of FEATURES) expect(isFeatureOn(f, 'live')).toBe(LIVE_FEATURES[f]);
  });

  it('keeps the features cut from the class demo off on Live', () => {
    expect(LIVE_FEATURES).toEqual({ orders: false, offers: false, referrals: false, parentPay: false });
  });
});
