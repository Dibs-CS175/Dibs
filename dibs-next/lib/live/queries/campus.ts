'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/queries/campus.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { notImplemented } from '@/lib/live/not-implemented';
import type { Result } from '@/lib/result';
import type { Campus, MeetupSpot } from '@/lib/types';

export async function getCampus(campusId: string): Promise<Result<Campus>> {
  // STUB(campus): replace with real implementation
  return notImplemented('getCampus', 'lib/live/queries/campus.ts');
}

/** The campus for this visitor: the signed-in user's campus, or the one the site was opened for. */
export async function getCurrentCampus(): Promise<Result<Campus>> {
  // STUB(campus): replace with real implementation
  return notImplemented('getCurrentCampus', 'lib/live/queries/campus.ts');
}

/** Public meetup spots the campus suggests for handoffs. */
export async function getMeetupSpots(campusId: string): Promise<Result<MeetupSpot[]>> {
  // STUB(campus): replace with real implementation
  return notImplemented('getMeetupSpots', 'lib/live/queries/campus.ts');
}
