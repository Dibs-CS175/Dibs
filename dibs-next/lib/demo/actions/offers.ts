// DEMO versions: fixture-backed stand-ins shown when the data source is Demo (the default).
// They are the working mockup, not production code. Write real code in lib/live/actions/offers.ts.

import { currentCampusId, simulate } from '@/lib/dev';
import { me } from '@/lib/fixtures/users';
import type { Result } from '@/lib/result';
import type { OfferChoice, OfferEvent } from '@/lib/types';

/** Logs that an offer (tier, Full Service or an add-on) was shown. Invisible to users. */
export async function recordOfferShown(offerKey: string): Promise<Result<OfferEvent>> {
  return simulate<OfferEvent>({
    id: `oe_${offerKey}`,
    userId: me.id,
    campusId: currentCampusId(),
    offerKey,
    shownAt: '2026-10-12T19:00:00Z',
  });
}

/** Logs which shown offers were chosen when the student submits. */
export async function recordOfferChoices(choices: OfferChoice[]): Promise<Result<{ recorded: number }>> {
  return simulate({ recorded: choices.length });
}
