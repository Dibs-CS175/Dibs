import { currentCampusId, simulate } from '@/lib/dev';
import { me } from '@/lib/fixtures/users';
import type { Result } from '@/lib/result';
import type { OfferChoice, OfferEvent } from '@/lib/types';

/** Logs that an offer (tier, Full Service or an add-on) was shown. Invisible to users. */
export async function recordOfferShown(offerKey: string): Promise<Result<OfferEvent>> {
  // STUB(offers): replace with real implementation
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
  // STUB(offers): replace with real implementation
  return simulate({ recorded: choices.length });
}
