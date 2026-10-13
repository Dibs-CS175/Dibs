'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/queries/messages.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { notImplemented } from '@/lib/live/not-implemented';
import type { Result } from '@/lib/result';
import type { ConversationSummary, Thread } from '@/lib/types';

export async function getInbox(): Promise<Result<ConversationSummary[]>> {
  // STUB(messages): replace with real implementation
  return notImplemented('getInbox', 'lib/live/queries/messages.ts');
}

export async function getThread(conversationId: string): Promise<Result<Thread>> {
  // STUB(messages): replace with real implementation
  return notImplemented('getThread', 'lib/live/queries/messages.ts');
}
