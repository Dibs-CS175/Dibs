'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/queries/messages.ts checks it against the demo version.
// Both queries call SQL functions from supabase/migrations/20261109000100_messaging_functions.sql,
// because RLS hides the other person's name from a direct users query.

import { isUuid, rpcResult } from '@/lib/live/rpc';
import { fail, type Result } from '@/lib/result';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ConversationSummary, Thread } from '@/lib/types';

export async function getInbox(): Promise<Result<ConversationSummary[]>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('get_inbox');
  return rpcResult<ConversationSummary[]>(data, error, 'Could not load your messages.');
}

/** Also marks the thread read for the viewer. A thread the viewer is not in returns NOT_FOUND. */
export async function getThread(conversationId: string): Promise<Result<Thread>> {
  if (!isUuid(conversationId)) return fail('NOT_FOUND', 'This conversation is gone.');

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('get_thread', { p_conversation_id: conversationId });
  return rpcResult<Thread>(data, error, 'Could not load this conversation.');
}
