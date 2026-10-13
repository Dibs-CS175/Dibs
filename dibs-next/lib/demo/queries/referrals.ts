// DEMO versions: fixture-backed stand-ins shown when the data source is Demo (the default).
// They are the working mockup, not production code. Write real code in lib/live/queries/referrals.ts.

import { simulate } from '@/lib/dev';
import type { Result } from '@/lib/result';
import type { ReferralCheck } from '@/lib/types';

/** Checks a referral code before it is applied. Errors: REFERRAL_INVALID. */
export async function checkReferralCode(code: string): Promise<Result<ReferralCheck>> {
  return simulate<ReferralCheck>({
    code: code.trim().toUpperCase(),
    description: 'Referral credit applied to your total.',
  });
}
