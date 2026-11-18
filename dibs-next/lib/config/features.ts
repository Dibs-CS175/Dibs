'use client';

// Features cut from the class demo. Their Live functions are still stubs in lib/live, so on Live data
// every way into them is hidden. Demo data (lib/demo) has working fixture versions and shows them all.
// To bring a feature back: build its stubs, then set its flag to true.

import { useDevState, type DataSource } from '@/lib/dev/state';

export const LIVE_FEATURES = {
  /** Orders list, order page, handoff codes, Hold to Dibs checkout. */
  orders: false,
  /** "Make an offer" on a listing. */
  offers: false,
  /** Referral code on Profile and referral credit. */
  referrals: false,
  /** The /pay/[token] page a parent opens. */
  parentPay: false,
} as const;

export type Feature = keyof typeof LIVE_FEATURES;

/** Demo data shows every feature. Live data shows only the ones that are built. */
export function isFeatureOn(feature: Feature, source: DataSource): boolean {
  return source === 'demo' || LIVE_FEATURES[feature];
}

/** Follows the data source picked in the preview panel, so switching to Demo shows everything again. */
export function useFeature(feature: Feature): boolean {
  return isFeatureOn(feature, useDevState().source);
}
