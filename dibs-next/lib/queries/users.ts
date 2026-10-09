import { simulate } from '@/lib/dev';
import { getDevState } from '@/lib/dev/state';
import { adminUser, me, users } from '@/lib/fixtures/users';
import type { Result } from '@/lib/result';
import type { Session, Settings, User } from '@/lib/types';

/** The signed-in user, or null when signed out. */
export async function getSession(): Promise<Result<Session | null>> {
  // STUB(users): replace with real implementation
  const { role } = getDevState();
  return simulate(role === 'signed_out' ? null : { user: role === 'admin' ? adminUser : me });
}

export async function getUser(userId: string): Promise<Result<User>> {
  // STUB(users): replace with real implementation
  return simulate(users.find((u) => u.id === userId) ?? me);
}

export async function getSettings(): Promise<Result<Settings>> {
  // STUB(users): replace with real implementation
  return simulate<Settings>({ dibsGesture: 'hold', housingType: me.housingType });
}
