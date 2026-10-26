'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/queries/users.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { fail, ok, type Result } from '@/lib/result';
import type { Session, Settings } from '@/lib/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { USER_COLUMNS, toSession, toSettings, type UserRow } from '@/lib/live/user-row';

/** The signed-in user and their campus, or null when signed out. */
export async function getSession(): Promise<Result<Session | null>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  // No cookie, an expired session or a bad refresh token all mean "signed out".
  // Only a server-side failure (5xx or no status) is an error the screen should show.
  if (error) {
    if (error.name === 'AuthSessionMissingError' || (error.status && error.status < 500)) return ok(null);
    return fail('UNKNOWN', `Could not check your session: ${error.message}`);
  }
  if (!data.user) return ok(null);

  const { data: row, error: rowError } = await supabase
    .from('users')
    .select(USER_COLUMNS)
    .eq('id', data.user.id)
    .maybeSingle<UserRow>();

  if (rowError) return fail('UNKNOWN', `Could not load your profile: ${rowError.message}`);
  if (!row) return ok(null);

  return toSession(row);
}

export async function getSettings(): Promise<Result<Settings>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return fail('NOT_SIGNED_IN', 'Sign in to see your settings.');

  const { data: row, error: rowError } = await supabase
    .from('users')
    .select('dibs_gesture, housing_type')
    .eq('id', data.user.id)
    .maybeSingle<Pick<UserRow, 'dibs_gesture' | 'housing_type'>>();

  if (rowError) return fail('UNKNOWN', `Could not load your settings: ${rowError.message}`);
  if (!row) return fail('NOT_FOUND', 'User profile not found.');

  return ok(toSettings(row));
}
