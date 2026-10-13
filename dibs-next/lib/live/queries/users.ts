'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/queries/users.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { notImplemented } from '@/lib/live/not-implemented';
import type { Result } from '@/lib/result';
import type { Session, Settings } from '@/lib/types';

/** The signed-in user and their campus, or null when signed out. */
export async function getSession(): Promise<Result<Session | null>> {
  // STUB(users): replace with real implementation
  return notImplemented('getSession', 'lib/live/queries/users.ts');
}

export async function getSettings(): Promise<Result<Settings>> {
  // STUB(users): replace with real implementation
  return notImplemented('getSettings', 'lib/live/queries/users.ts');
}
