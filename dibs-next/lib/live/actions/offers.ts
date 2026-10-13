'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/actions/offers.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { notImplemented } from '@/lib/live/not-implemented';
import type { Result } from '@/lib/result';
import type { OfferChoice, OfferEvent } from '@/lib/types';

/** Logs that an offer (tier, Full Service or an add-on) was shown. Invisible to users. */
export async function recordOfferShown(offerKey: string): Promise<Result<OfferEvent>> {
  // STUB(offers): replace with real implementation
  return notImplemented('recordOfferShown', 'lib/live/actions/offers.ts');
}

/** Logs which shown offers were chosen when the student submits. */
export async function recordOfferChoices(choices: OfferChoice[]): Promise<Result<{ recorded: number }>> {
  // STUB(offers): replace with real implementation
  return notImplemented('recordOfferChoices', 'lib/live/actions/offers.ts');
}
