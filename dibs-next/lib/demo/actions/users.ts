// DEMO versions: fixture-backed stand-ins shown when the data source is Demo (the default).
// They are the working mockup, not production code. Write real code in lib/live/actions/users.ts.

import { currentCampusId, setDevState, simulate } from '@/lib/dev';
import { RESEND_SECONDS } from '@/lib/config/app';
import { campuses } from '@/lib/fixtures/campuses';
import { me } from '@/lib/fixtures/users';
import type { Result } from '@/lib/result';
import type { HousingType, Session, Settings } from '@/lib/types';

/** Sends a 6-digit code. Errors: VALIDATION, NOT_EDU, RATE_LIMITED. */
export async function requestVerificationCode(
  email: string,
): Promise<Result<{ sentTo: string; resendAfterSeconds: number }>> {
  return simulate({ sentTo: email, resendAfterSeconds: RESEND_SECONDS });
}

/**
 * Checks the code and starts a session. The backend decides the campus from the email; the stub
 * returns the campus chosen in the dev toolbar. Errors: CODE_INVALID, RATE_LIMITED.
 */
export async function verifyCode(email: string, code: string): Promise<Result<Session>> {
  void code;
  const campus = campuses.find((c) => c.id === currentCampusId()) ?? campuses[0]!;
  const r = await simulate<Session>({ user: { ...me, email, campusId: campus.id }, campus });
  if (r.ok) setDevState({ role: 'student' });
  return r;
}

export async function setHousingType(housingType: HousingType): Promise<Result<Settings>> {
  return simulate<Settings>({ dibsGesture: 'hold', housingType });
}

export async function updateSettings(settings: Settings): Promise<Result<Settings>> {
  return simulate(settings);
}

export async function signOut(): Promise<Result<null>> {
  const r = await simulate(null);
  if (r.ok) setDevState({ role: 'signed_out' });
  return r;
}
