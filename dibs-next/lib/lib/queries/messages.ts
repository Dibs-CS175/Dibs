import { simulate } from '@/lib/dev';
import { listings } from '@/lib/fixtures/listings';
import { acceptedProposalIds, conversations, messages } from '@/lib/fixtures/messages';
import { findUser, me } from '@/lib/fixtures/users';
import type { Result } from '@/lib/result';
import type { Conversation, ConversationSummary, Thread } from '@/lib/types';

const parts = (c: Conversation) => {
  const l = listings.find((x) => x.id === c.listingId)!;
  const other = findUser(c.participantIds.find((p) => p !== me.id)!);
  return {
    campusId: l.campusId,
    listing: { id: l.id, title: l.title, photos: l.photos, priceCents: l.priceCents, status: l.status },
    otherUser: { id: other.id, firstName: other.firstName, lastInitial: other.lastInitial },
  };
};

export async function getInbox(): Promise<Result<ConversationSummary[]>> {
  // STUB(messages): replace with real implementation
  const data = conversations.map((c) => {
    const { listing, otherUser } = parts(c);
    const last = [...messages].reverse().find((m) => m.conversationId === c.id);
    return {
      conversation: c,
      listing,
      otherUser,
      lastMessagePreview: last ? (last.kind === 'meetup_proposal' ? 'Suggested a meetup' : last.body) : '',
    };
  });
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
    acceptedProposalIds,
    listingSold: p.listing.status === 'sold',
  });
}
