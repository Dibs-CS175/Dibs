import { simulate } from '@/lib/dev';
import { conversations } from '@/lib/fixtures/messages';
import { me } from '@/lib/fixtures/users';
import type { Result } from '@/lib/result';
import type { Conversation, Message } from '@/lib/types';

export async function sendMessage(conversationId: string, body: string): Promise<Result<Message>> {
  // STUB(messages): replace with real implementation
  return simulate<Message>({
    id: `m_${Date.now()}`,
    conversationId,
    senderId: me.id,
    body,
    createdAt: new Date().toISOString(),
  });
}

/** Opens (or reuses) the conversation about a listing. */
export async function startConversation(listingId: string): Promise<Result<Conversation>> {
  // STUB(messages): replace with real implementation
  return simulate(conversations.find((c) => c.listingId === listingId) ?? conversations[1]!);
}
