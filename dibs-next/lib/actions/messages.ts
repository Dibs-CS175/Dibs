// Pages import from this file. Each function runs its Demo version (fixtures, lib/demo/actions/messages.ts)
// or its Live version (your code, lib/live/actions/messages.ts), depending on the data source picked in
// the preview panel (/dev). Nothing else belongs here.

import { choose } from '@/lib/dev/choose';
import * as demo from '@/lib/demo/actions/messages';
import * as live from '@/lib/live/actions/messages';

export const sendMessage = choose(demo.sendMessage, live.sendMessage);
export const proposeMeetup = choose(demo.proposeMeetup, live.proposeMeetup);
export const acceptMeetup = choose(demo.acceptMeetup, live.acceptMeetup);
export const startConversation = choose(demo.startConversation, live.startConversation);
