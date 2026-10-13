'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/actions/messages.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { notImplemented } from '@/lib/live/not-implemented';
import type { Result } from '@/lib/result';
import type { Conversation, Message } from '@/lib/types';

/** Errors: VALIDATION, RATE_LIMITED, CONFLICT (listing sold). */
export async function sendMessage(conversationId: string, body: string): Promise<Result<Message>> {
  // STUB(messages): replace with real implementation
  return notImplemented('sendMessage', 'lib/live/actions/messages.ts');
}

/** Sends a meetup_proposal message the other person can accept. Errors: VALIDATION. */
export async function proposeMeetup(
  conversationId: string,
  meetupSpotId: string,
  meetupTime: string,
): Promise<Result<Message>> {
  // STUB(messages): replace with real implementation
  return notImplemented('proposeMeetup', 'lib/live/actions/messages.ts');
}

/** Accepts a proposal. Errors: CONFLICT (a newer proposal replaced it). */
export async function acceptMeetup(messageId: string): Promise<Result<{ messageId: string }>> {
  // STUB(messages): replace with real implementation
  return notImplemented('acceptMeetup', 'lib/live/actions/messages.ts');
}

/** Opens (or reuses) the conversation about a listing. */
export async function startConversation(listingId: string): Promise<Result<Conversation>> {
  // STUB(messages): replace with real implementation
  return notImplemented('startConversation', 'lib/live/actions/messages.ts');
}
