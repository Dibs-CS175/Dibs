'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/actions/users.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { notImplemented } from '@/lib/live/not-implemented';
import type { Result } from '@/lib/result';
import type { HousingType, Session, Settings } from '@/lib/types';

/** Sends a 6-digit code. Errors: VALIDATION, NOT_EDU, RATE_LIMITED. */
export async function requestVerificationCode(
  email: string,
): Promise<Result<{ sentTo: string; resendAfterSeconds: number }>> {
  // STUB(users): replace with real implementation
  return notImplemented('requestVerificationCode', 'lib/live/actions/users.ts');
}

/**
 * Checks the code and starts a session. The backend decides the campus from the email.
 * Errors: CODE_INVALID, RATE_LIMITED.
 */
export async function verifyCode(email: string, code: string): Promise<Result<Session>> {
  // STUB(users): replace with real implementation
  return notImplemented('verifyCode', 'lib/live/actions/users.ts');
}

export async function setHousingType(housingType: HousingType): Promise<Result<Settings>> {
  // STUB(users): replace with real implementation
  return notImplemented('setHousingType', 'lib/live/actions/users.ts');
}

export async function updateSettings(settings: Settings): Promise<Result<Settings>> {
  // STUB(users): replace with real implementation
  return notImplemented('updateSettings', 'lib/live/actions/users.ts');
}

export async function signOut(): Promise<Result<null>> {
  // STUB(users): replace with real implementation
  return notImplemented('signOut', 'lib/live/actions/users.ts');
}
