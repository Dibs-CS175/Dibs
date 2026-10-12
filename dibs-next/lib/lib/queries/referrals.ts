import { simulate } from '@/lib/dev';
import type { Result } from '@/lib/result';
import type { ReferralCheck } from '@/lib/types';

/** Checks a referral code before it is applied. Errors: REFERRAL_INVALID. */
export async function checkReferralCode(code: string): Promise<Result<ReferralCheck>> {
  // STUB(referrals): replace with real implementation
  return simulate<ReferralCheck>({
    code: code.trim().toUpperCase(),
    description: 'Referral credit applied to your total.',
  });
}
