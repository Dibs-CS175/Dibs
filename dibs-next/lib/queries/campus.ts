// Pages import from this file. Each function runs its Demo version (fixtures, lib/demo/queries/campus.ts)
// or its Live version (your code, lib/live/queries/campus.ts), depending on the data source picked in
// the preview panel (/dev). Nothing else belongs here.

import { choose } from '@/lib/dev/choose';
import * as demo from '@/lib/demo/queries/campus';
import * as live from '@/lib/live/queries/campus';

export const getCampus = choose(demo.getCampus, live.getCampus);
export const getCurrentCampus = choose(demo.getCurrentCampus, live.getCurrentCampus);
export const getMeetupSpots = choose(demo.getMeetupSpots, live.getMeetupSpots);
