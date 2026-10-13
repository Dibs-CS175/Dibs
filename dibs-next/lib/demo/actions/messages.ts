// DEMO versions: fixture-backed stand-ins shown when the data source is Demo (the default).
// They are the working mockup, not production code. Write real code in lib/live/actions/messages.ts.

import { simulate } from '@/lib/dev';
import { conversations } from '@/lib/fixtures/messages';
import { me } from '@/lib/fixtures/users';
import type { Result } from '@/lib/result';
import type { Conversation, Message } from '@/lib/types';

const NOW = '2026-10-12T19:00:00Z';

/** Errors: VALIDATION, RATE_LIMITED, CONFLICT (listing sold). */
export async function sendMessage(conversationId: string, body: string): Promise<Result<Message>> {
  return simulate<Message>({
    id: `m_${Date.now()}`,
    conversationId,
    senderId: me.id,
    body,
    kind: 'text',
    createdAt: NOW,
  });
}

/** Sends a meetup_proposal message the other person can accept. Errors: VALIDATION. */
export async function proposeMeetup(
  conversationId: string,
  meetupSpotId: string,
  meetupTime: string,
): Promise<Result<Message>> {
  return simulate<Message>({
    id: `m_${Date.now()}`,
    conversationId,
    senderId: me.id,
    body: 'Suggested a meetup',
    kind: 'meetup_proposal',
    meetupSpotId,
    meetupTime,
    createdAt: NOW,
  });
}

/** Accepts a proposal. Errors: CONFLICT (a newer proposal replaced it). */
export async function acceptMeetup(messageId: string): Promise<Result<{ messageId: string }>> {
  return simulate({ messageId });
}

/** Opens (or reuses) the conversation about a listing. */
export async function startConversation(listingId: string): Promise<Result<Conversation>> {
  return simulate(conversations.find((c) => c.listingId === listingId) ?? conversations[1]!);
}
