// Pages import from this file. Each function runs its Demo version (fixtures, lib/demo/queries/users.ts)
// or its Live version (your code, lib/live/queries/users.ts), depending on the data source picked in
// the preview panel (/dev). Nothing else belongs here.

import { choose } from '@/lib/dev/choose';
import * as demo from '@/lib/demo/queries/users';
import * as live from '@/lib/live/queries/users';

export const getSession = choose(demo.getSession, live.getSession);
export const getSettings = choose(demo.getSettings, live.getSettings);
