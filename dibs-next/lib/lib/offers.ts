'use client';

import { useEffect, useRef } from 'react';
import { recordOfferChoices, recordOfferShown } from '@/lib/actions/offers';
import type { OfferChoice } from '@/lib/types';

/** Offer keys, so every screen names offers the same way. */
export const offerKey = {
  tier: (key: string) => `registration_tier:${key}`,
  fullService: 'full_service',
  addOn: (key: string) => `addon:${key}`,
};

/**
 * Records each offer key once per mount when it is shown. Tracking is invisible to users, so a failed
 * call is dropped on purpose; it never blocks or changes the screen.
 */
export function useOffersShown(keys: string[]) {
  const sent = useRef(new Set<string>());
  const joined = keys.join('|');
  useEffect(() => {
    for (const k of joined ? joined.split('|') : []) {
      if (sent.current.has(k)) continue;
      sent.current.add(k);
      void recordOfferShown(k).then((r) => {
        if (!r.ok) sent.current.delete(k);
      });
    }
  }, [joined]);
}

/** Records which shown offers were chosen. Fire and forget, for the same reason. */
export function sendOfferChoices(choices: OfferChoice[]) {
  void recordOfferChoices(choices).then((r) => {
    if (!r.ok) return; // Dropped on purpose: tracking never surfaces to the user.
  });
}
