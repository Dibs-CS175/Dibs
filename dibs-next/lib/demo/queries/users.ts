// DEMO versions: fixture-backed stand-ins shown when the data source is Demo (the default).
// They are the working mockup, not production code. Write real code in lib/live/queries/users.ts.

import { currentCampusId, getDevState, simulate } from '@/lib/dev';
import { campuses } from '@/lib/fixtures/campuses';
import { adminUser, me } from '@/lib/fixtures/users';
import type { Result } from '@/lib/result';
import type { Session, Settings } from '@/lib/types';

/** The signed-in user and their campus, or null when signed out. The dev toolbar picks role and campus. */
export async function getSession(): Promise<Result<Session | null>> {
  const { role } = getDevState();
  const campus = campuses.find((c) => c.id === currentCampusId()) ?? campuses[0]!;
  const user = role === 'admin' ? adminUser : me;
  return simulate<Session | null>(
    role === 'signed_out' ? null : { user: { ...user, campusId: campus.id }, campus },
  );
}

export async function getSettings(): Promise<Result<Settings>> {
  return simulate<Settings>({ dibsGesture: 'hold', housingType: me.housingType });
}
