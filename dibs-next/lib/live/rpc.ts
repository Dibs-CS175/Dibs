// Shared by Live actions and queries that call Dibs SQL functions through supabase.rpc().
// Not a server action file, so it can export plain functions.

import { ERROR_CODES, fail, ok, type ErrorCode, type Result } from '@/lib/result';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID.test(value);
}

/**
 * Turns what a Dibs SQL function returns into a Result. The functions answer with
 * { ok: true, data } or { ok: false, error_code, message }, the same shape as claim_listing.
 */
export function rpcResult<T>(data: unknown, error: { message: string } | null, fallback: string): Result<T> {
  if (error || !data || typeof data !== 'object') return fail('UNKNOWN', fallback);
  const body = data as { ok?: unknown; data?: unknown; error_code?: unknown; message?: unknown };
  if (body.ok === true) return ok(body.data as T);
  const code = ERROR_CODES.includes(body.error_code as ErrorCode)
    ? (body.error_code as ErrorCode)
    : 'UNKNOWN';
  return fail(code, typeof body.message === 'string' ? body.message : fallback);
}
