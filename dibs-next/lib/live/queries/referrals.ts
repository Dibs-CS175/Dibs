'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/queries/referrals.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { notImplemented } from '@/lib/live/not-implemented';
import type { Result } from '@/lib/result';
import type { ReferralCheck } from '@/lib/types';

/** Checks a referral code before it is applied. Errors: REFERRAL_INVALID. */
export async function checkReferralCode(code: string): Promise<Result<ReferralCheck>> {
  // STUB(referrals): replace with real implementation
  return notImplemented('checkReferralCode', 'lib/live/queries/referrals.ts');
}
