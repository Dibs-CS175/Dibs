'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/actions/messages.ts checks it against the demo version.
// Each action calls a SQL function from supabase/migrations/20261109000100_messaging_functions.sql,
// which checks the signed-in user, campus and listing status inside the database.

import { isUuid, rpcResult } from '@/lib/live/rpc';
import { fail, type Result } from '@/lib/result';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Conversation, Message } from '@/lib/types';

const MAX_BODY_CHARS = 2000;

/** Errors: VALIDATION, RATE_LIMITED, CONFLICT (listing sold). */
export async function sendMessage(conversationId: string, body: string): Promise<Result<Message>> {
  if (!isUuid(conversationId)) return fail('NOT_FOUND', 'This conversation is gone.');
  const text = body.trim();
  if (!text) return fail('VALIDATION', 'Write a message first.');
  if ([...text].length > MAX_BODY_CHARS) return fail('VALIDATION', 'Messages can be up to 2,000 characters.');

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('send_message', {
    p_conversation_id: conversationId,
    p_body: text,
  });
  return rpcResult<Message>(data, error, 'Could not send your message.');
}

/** Sends a meetup_proposal message the other person can accept. Errors: VALIDATION. */
export async function proposeMeetup(
  conversationId: string,
  meetupSpotId: string,
  meetupTime: string,
): Promise<Result<Message>> {
  if (!isUuid(conversationId)) return fail('NOT_FOUND', 'This conversation is gone.');
  if (!isUuid(meetupSpotId)) return fail('VALIDATION', 'Pick a meetup spot from the campus list.');
  const time = new Date(meetupTime);
  if (Number.isNaN(time.getTime())) return fail('VALIDATION', 'Pick a day and time for the meetup.');

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('propose_meetup', {
    p_conversation_id: conversationId,
    p_spot_id: meetupSpotId,
    p_time: time.toISOString(),
  });
  return rpcResult<Message>(data, error, 'Could not send your meetup suggestion.');
}

/** Accepts a proposal. Errors: CONFLICT (a newer proposal replaced it). */
export async function acceptMeetup(messageId: string): Promise<Result<{ messageId: string }>> {
  if (!isUuid(messageId)) return fail('NOT_FOUND', 'That meetup suggestion is gone.');

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('accept_meetup', { p_message_id: messageId });
  return rpcResult<{ messageId: string }>(data, error, 'Could not accept the meetup.');
}

/** Opens (or reuses) the conversation about a listing. */
export async function startConversation(listingId: string): Promise<Result<Conversation>> {
  if (!isUuid(listingId)) return fail('NOT_FOUND', 'Listing not found.');

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('start_conversation', { p_listing_id: listingId });
  return rpcResult<Conversation>(data, error, 'Could not open the conversation.');
}
