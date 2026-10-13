// DEMO versions: fixture-backed stand-ins shown when the data source is Demo (the default).
// They are the working mockup, not production code. Write real code in lib/live/queries/campus.ts.

import { currentCampusId, simulate } from '@/lib/dev';
import { campuses, meetupSpots } from '@/lib/fixtures/campuses';
import type { Result } from '@/lib/result';
import type { Campus, MeetupSpot } from '@/lib/types';

export async function getCampus(campusId: string): Promise<Result<Campus>> {
  return simulate(campuses.find((c) => c.id === campusId) ?? campuses[0]!);
}

/** The campus for this visitor: the signed-in user's campus, or the one the site was opened for. */
export async function getCurrentCampus(): Promise<Result<Campus>> {
  return simulate(campuses.find((c) => c.id === currentCampusId()) ?? campuses[0]!);
}

/** Public meetup spots the campus suggests for handoffs. */
export async function getMeetupSpots(campusId: string): Promise<Result<MeetupSpot[]>> {
  return simulate(
    meetupSpots.filter((s) => s.campusId === campusId),
    [],
  );
}
