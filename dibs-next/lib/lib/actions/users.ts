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
  // STUB(users): replace with real implementation
  return simulate({ sentTo: email, resendAfterSeconds: RESEND_SECONDS });
}

/**
 * Checks the code and starts a session. The backend decides the campus from the email; the stub
 * returns the campus chosen in the dev toolbar. Errors: CODE_INVALID, RATE_LIMITED.
 */
export async function verifyCode(email: string, code: string): Promise<Result<Session>> {
  // STUB(users): replace with real implementation
  void code;
  const campus = campuses.find((c) => c.id === currentCampusId()) ?? campuses[0]!;
  const r = await simulate<Session>({ user: { ...me, email, campusId: campus.id }, campus });
  if (r.ok) setDevState({ role: 'student' });
  return r;
}

export async function setHousingType(housingType: HousingType): Promise<Result<Settings>> {
  // STUB(users): replace with real implementation
  return simulate<Settings>({ dibsGesture: 'hold', housingType });
}

export async function updateSettings(settings: Settings): Promise<Result<Settings>> {
  // STUB(users): replace with real implementation
  return simulate(settings);
}

export async function signOut(): Promise<Result<null>> {
  // STUB(users): replace with real implementation
  const r = await simulate(null);
  if (r.ok) setDevState({ role: 'signed_out' });
  return r;
}
