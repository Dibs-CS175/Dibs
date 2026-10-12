import { currentCampusId, getDevState, simulate } from '@/lib/dev';
import { campuses } from '@/lib/fixtures/campuses';
import { adminUser, me } from '@/lib/fixtures/users';
import type { Result } from '@/lib/result';
import type { Session, Settings } from '@/lib/types';

/** The signed-in user and their campus, or null when signed out. The dev toolbar picks role and campus. */
export async function getSession(): Promise<Result<Session | null>> {
  // STUB(users): replace with real implementation
  const { role } = getDevState();
  const campus = campuses.find((c) => c.id === currentCampusId()) ?? campuses[0]!;
  const user = role === 'admin' ? adminUser : me;
  return simulate<Session | null>(
    role === 'signed_out' ? null : { user: { ...user, campusId: campus.id }, campus },
  );
}

export async function getSettings(): Promise<Result<Settings>> {
  // STUB(users): replace with real implementation
  return simulate<Settings>({ dibsGesture: 'hold', housingType: me.housingType });
}
