import { simulate } from '@/lib/dev';
import { listings } from '@/lib/fixtures/listings';
import { conversations, messages } from '@/lib/fixtures/messages';
import { me, users } from '@/lib/fixtures/users';
import type { Result } from '@/lib/result';
import type { Conversation, ConversationSummary, Thread } from '@/lib/types';

const parts = (c: Conversation) => {
  const l = listings.find((x) => x.id === c.listingId)!;
  const other = users.find((u) => u.id === c.participantIds.find((p) => p !== me.id))!;
  return {
    listing: { id: l.id, title: l.title, photos: l.photos, priceCents: l.priceCents, status: l.status },
    otherUser: { id: other.id, firstName: other.firstName, lastInitial: other.lastInitial },
  };
};

export async function getInbox(): Promise<Result<ConversationSummary[]>> {
  // STUB(messages): replace with real implementation
  const data = conversations.map((c) => ({
    conversation: c,
    ...parts(c),
    lastMessagePreview: [...messages].reverse().find((m) => m.conversationId === c.id)?.body ?? '',
  }));
  return simulate(data, []);
}

export async function getThread(conversationId: string): Promise<Result<Thread>> {
  // STUB(messages): replace with real implementation
  const c = conversations.find((x) => x.id === conversationId) ?? conversations[0]!;
  const p = parts(c);
  return simulate<Thread>({
    conversation: c,
    ...p,
    messages: messages.filter((m) => m.conversationId === c.id),
    viewerId: me.id,
    listingSold: p.listing.status === 'sold',
  });
}
