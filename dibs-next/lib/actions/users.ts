import { simulate } from '@/lib/dev';
import { setDevState } from '@/lib/dev/state';
import { me } from '@/lib/fixtures/users';
import type { Result } from '@/lib/result';
import type { HousingType, Session, Settings } from '@/lib/types';

/** Sends a 6-digit code to a campus email. */
export async function requestVerificationCode(
  email: string,
): Promise<Result<{ sentTo: string; resendAfterSeconds: number }>> {
  // STUB(users): replace with real implementation
  return simulate({ sentTo: email, resendAfterSeconds: 30 });
}

/** Checks the code and starts a session. */
export async function verifyCode(email: string, code: string): Promise<Result<Session>> {
  // STUB(users): replace with real implementation
  void code;
  const r = await simulate<Session>({ user: { ...me, email } });
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
