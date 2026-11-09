'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/queries/campus.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { fail, ok, type Result } from '@/lib/result';
import type { Campus, MeetupSpot } from '@/lib/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type CampusRow = { id: string; name: string; email_domain: string; timezone: string };
type SpotRow = { id: string; campus_id: string; name: string; description: string | null };

const CAMPUS_COLUMNS = 'id, name, email_domain, timezone';
const NO_CAMPUS = 'No campus is set up yet.';

const toCampus = (r: CampusRow): Campus => ({
  id: r.id,
  name: r.name,
  emailDomain: r.email_domain,
  timezone: r.timezone,
});

export async function getCampus(campusId: string): Promise<Result<Campus>> {
  if (typeof campusId !== 'string' || !campusId) return fail('VALIDATION', 'Pick a campus.');
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('campuses')
    .select(CAMPUS_COLUMNS)
    .eq('id', campusId)
    .maybeSingle<CampusRow>();
  if (error) return fail('UNKNOWN', 'Could not load the campus. Try again.');
  if (!data) return fail('NOT_FOUND', 'Campus not found.');
  return ok(toCampus(data));
}

/** The campus for this visitor: the signed-in user's campus, or the one the site was opened for. */
export async function getCurrentCampus(): Promise<Result<Campus>> {
  const supabase = await createSupabaseServerClient();

  // A signed-in user's campus wins. A missing or unknown campus falls through to the site default.
  const { data: auth } = await supabase.auth.getUser();
  if (auth.user) {
    const { data: row } = await supabase
      .from('users')
      .select('campus_id')
      .eq('id', auth.user.id)
      .maybeSingle<{ campus_id: string }>();
    if (row?.campus_id) {
      const { data: own } = await supabase
        .from('campuses')
        .select(CAMPUS_COLUMNS)
        .eq('id', row.campus_id)
        .maybeSingle<CampusRow>();
      if (own) return ok(toCampus(own));
    }
  }

  // The site default is the first campus by id, matching the demo ('riverside').
  const { data, error } = await supabase
    .from('campuses')
    .select(CAMPUS_COLUMNS)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle<CampusRow>();
  if (error) return fail('UNKNOWN', 'Could not load the campus. Try again.');
  if (!data) return fail('NOT_FOUND', NO_CAMPUS);
  return ok(toCampus(data));
}

/** Public meetup spots the campus suggests for handoffs. */
export async function getMeetupSpots(campusId: string): Promise<Result<MeetupSpot[]>> {
  if (typeof campusId !== 'string' || !campusId) return fail('VALIDATION', 'Pick a campus.');
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('meetup_spots')
    .select('id, campus_id, name, description')
    .eq('campus_id', campusId)
    .order('name', { ascending: true })
    .returns<SpotRow[]>();
  if (error) return fail('UNKNOWN', 'Could not load meetup spots. Try again.');
  return ok(
    (data ?? []).map((s) => ({ id: s.id, campusId: s.campus_id, name: s.name, description: s.description ?? '' })),
  );
}
