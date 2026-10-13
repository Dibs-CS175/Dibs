// Pages import from this file. Each function runs its Demo version (fixtures, lib/demo/queries/messages.ts)
// or its Live version (your code, lib/live/queries/messages.ts), depending on the data source picked in
// the preview panel (/dev). Nothing else belongs here.

import { choose } from '@/lib/dev/choose';
import * as demo from '@/lib/demo/queries/messages';
import * as live from '@/lib/live/queries/messages';

export const getInbox = choose(demo.getInbox, live.getInbox);
export const getThread = choose(demo.getThread, live.getThread);
