// Turns a row from public.users into the app's User and Session types.
// Shared by lib/live/queries/users.ts and lib/live/actions/users.ts. Not a server action file,
// so it can export plain functions and constants.

import { fail, ok, type Result } from '@/lib/result';
import { campuses } from '@/lib/fixtures/campuses';
import type { HousingType, Session, Settings, User } from '@/lib/types';

export const USER_COLUMNS =
  'id, campus_id, first_name, last_initial, email, housing_type, dibs_gesture, role, verified, trades_count, member_since, referral_code';

export interface UserRow {
  id: string;
  campus_id: string;
  first_name: string;
  last_initial: string;
  email: string;
  housing_type: string | null;
  dibs_gesture: string;
  role: string;
  verified: boolean;
  trades_count: number;
  member_since: string;
  referral_code: string;
}

const HOUSING: HousingType[] = ['hall', 'campus_apartment', 'off_campus', 'commuter'];

export function isHousingType(v: unknown): v is HousingType {
  return typeof v === 'string' && (HOUSING as string[]).includes(v);
}

export function toUser(row: UserRow): User {
  return {
    id: row.id,
    campusId: row.campus_id,
    firstName: row.first_name,
    lastInitial: row.last_initial,
    email: row.email,
    housingType: isHousingType(row.housing_type) ? row.housing_type : null,
    role: row.role === 'admin' ? 'admin' : 'student',
    verified: row.verified,
    tradesCount: row.trades_count,
    memberSince: row.member_since,
    referralCode: row.referral_code,
  };
}

export function toSession(row: UserRow): Result<Session> {
  const campus = campuses.find((c) => c.id === row.campus_id);
  if (!campus) return fail('FORBIDDEN', 'This account is not linked to a supported campus.');
  return ok({ user: toUser(row), campus });
}

export function toSettings(row: Pick<UserRow, 'dibs_gesture' | 'housing_type'>): Settings {
  return {
    dibsGesture: row.dibs_gesture === 'tap' ? 'tap' : 'hold',
    housingType: isHousingType(row.housing_type) ? row.housing_type : null,
  };
}
