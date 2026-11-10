import { afterEach, describe, expect, it, vi } from 'vitest';

// A fake Supabase client: each rpc returns what the test put in `db.rpc`, and records its arguments.
const db = vi.hoisted(() => ({
  rpc: {} as Record<string, { data: unknown; error: { message: string } | null }>,
  calls: [] as { fn: string; args: unknown }[],
}));

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => ({
    rpc: async (fn: string, args?: unknown) => {
      db.calls.push({ fn, args });
      return db.rpc[fn] ?? { data: null, error: null };
    },
  }),
}));

import { acceptMeetup, proposeMeetup, sendMessage, startConversation } from './actions/messages';
import { getInbox, getThread } from './queries/messages';
import { isUuid, rpcResult } from './rpc';

const CONV = '6f1b6c55-2a4f-4d0b-9a3e-1d2c3b4a5f60';
const SPOT = '0b7c2e9a-5d14-4f3e-8a21-9c8d7e6f5a40';
const code = (r: { ok: boolean; error?: { code: string } }) => (r.ok ? null : r.error?.code);
const okEnvelope = (data: unknown) => ({ data: { ok: true, data }, error: null });
const failEnvelope = (error_code: string, message = 'x') => ({
  data: { ok: false, error_code, message },
  error: null,
});

afterEach(() => {
  db.rpc = {};
  db.calls = [];
});

describe('rpcResult', () => {
  it('passes data and known error codes through', () => {
    expect(rpcResult({ ok: true, data: [1] }, null, 'f')).toEqual({ ok: true, data: [1] });
    expect(rpcResult({ ok: false, error_code: 'CONFLICT', message: 'Sold' }, null, 'f')).toEqual({
      ok: false,
      error: { code: 'CONFLICT', message: 'Sold' },
    });
  });

  it('maps transport errors, empty answers and unknown codes to UNKNOWN', () => {
    expect(code(rpcResult(null, { message: 'boom' }, 'f'))).toBe('UNKNOWN');
    expect(code(rpcResult(null, null, 'f'))).toBe('UNKNOWN');
    expect(rpcResult({ ok: false, error_code: 'WEIRD' }, null, 'fallback')).toEqual({
      ok: false,
      error: { code: 'UNKNOWN', message: 'fallback' },
    });
  });

  it('checks uuids', () => {
    expect(isUuid(CONV)).toBe(true);
    expect(isUuid('c_1')).toBe(false);
    expect(isUuid(`${CONV} or 1=1`)).toBe(false);
  });
});

describe('sendMessage', () => {
  it('trims and sends through send_message', async () => {
    const msg = { id: 'm1', conversationId: CONV, senderId: 'u1', body: 'hi', kind: 'text', createdAt: 't' };
    db.rpc.send_message = okEnvelope(msg);
    expect(await sendMessage(CONV, '  hi  ')).toEqual({ ok: true, data: msg });
    expect(db.calls).toEqual([{ fn: 'send_message', args: { p_conversation_id: CONV, p_body: 'hi' } }]);
  });

  it('rejects empty, too long and bad ids without calling the database', async () => {
    expect(code(await sendMessage(CONV, '   '))).toBe('VALIDATION');
    expect(code(await sendMessage(CONV, 'x'.repeat(2001)))).toBe('VALIDATION');
    expect(code(await sendMessage('c_1', 'hi'))).toBe('NOT_FOUND');
    expect(db.calls).toHaveLength(0);
  });

  it('counts emoji as one character each', async () => {
    db.rpc.send_message = okEnvelope({});
    expect((await sendMessage(CONV, '😀'.repeat(2000))).ok).toBe(true);
  });

  it('passes database errors through', async () => {
    db.rpc.send_message = failEnvelope('RATE_LIMITED');
    expect(code(await sendMessage(CONV, 'hi'))).toBe('RATE_LIMITED');
    db.rpc.send_message = failEnvelope('CONFLICT');
    expect(code(await sendMessage(CONV, 'hi'))).toBe('CONFLICT');
  });
});

describe('proposeMeetup', () => {
  it('sends the time as ISO', async () => {
    db.rpc.propose_meetup = okEnvelope({ id: 'm2' });
    await proposeMeetup(CONV, SPOT, '2027-01-05T20:00:00.000Z');
    expect(db.calls[0]).toEqual({
      fn: 'propose_meetup',
      args: { p_conversation_id: CONV, p_spot_id: SPOT, p_time: '2027-01-05T20:00:00.000Z' },
    });
  });

  it('rejects a bad spot or time', async () => {
    expect(code(await proposeMeetup(CONV, 'spot_1', '2027-01-05T20:00:00Z'))).toBe('VALIDATION');
    expect(code(await proposeMeetup(CONV, SPOT, 'tomorrow-ish'))).toBe('VALIDATION');
    expect(db.calls).toHaveLength(0);
  });
});

describe('acceptMeetup and startConversation', () => {
  it('call their functions', async () => {
    db.rpc.accept_meetup = failEnvelope('CONFLICT');
    expect(code(await acceptMeetup(CONV))).toBe('CONFLICT');
    db.rpc.start_conversation = okEnvelope({ id: CONV });
    expect(await startConversation(SPOT)).toEqual({ ok: true, data: { id: CONV } });
    expect(db.calls.map((c) => c.fn)).toEqual(['accept_meetup', 'start_conversation']);
  });

  it('return NOT_FOUND for ids that are not uuids', async () => {
    expect(code(await acceptMeetup('m_1'))).toBe('NOT_FOUND');
    expect(code(await startConversation('l_1'))).toBe('NOT_FOUND');
  });
});

describe('getInbox and getThread', () => {
  it('return the function data', async () => {
    db.rpc.get_inbox = okEnvelope([]);
    expect(await getInbox()).toEqual({ ok: true, data: [] });
    db.rpc.get_thread = failEnvelope('NOT_FOUND');
    expect(code(await getThread(CONV))).toBe('NOT_FOUND');
  });

  it('treats a malformed thread id as not found', async () => {
    expect(code(await getThread('../admin'))).toBe('NOT_FOUND');
    expect(db.calls).toHaveLength(0);
  });

  it('reports a transport error as UNKNOWN', async () => {
    db.rpc.get_inbox = { data: null, error: { message: 'offline' } };
    expect(code(await getInbox())).toBe('UNKNOWN');
  });
});
