import type { ErrorCode, Result } from '@/lib/result';
import { getDevState } from './state';

const DEFAULT_MESSAGES: Record<ErrorCode, string> = {
  NOT_SIGNED_IN: 'Sign in to continue.',
  FORBIDDEN: "You don't have access to this.",
  NOT_FOUND: "We couldn't find that.",
  VALIDATION: 'Some fields need another look.',
  CONFLICT: 'Someone else changed this first.',
  RATE_LIMITED: 'Too many tries. Wait a minute and try again.',
  PAYMENT_FAILED: 'The payment did not go through.',
  SLOT_FULL: 'That time slot just filled up.',
  DEADLINE_PASSED: 'The deadline for this has passed.',
  CAPACITY_FULL: 'That bin is full.',
  CODE_INVALID: "That code doesn't match. 2 attempts left.",
  UNKNOWN: 'Something went wrong. Try again.',
};

const NORMAL_DELAY_MS = 400;
const SLOW_DELAY_MS = 3000;

let queryDepth = 0;

/**
 * Marks stubs started inside `fn` as queries, so the toolbar's "actions only" scope can skip them.
 * Stubs read dev state synchronously when called, so the flag only needs to hold for the synchronous call.
 */
export function runAsQuery<T>(fn: () => T): T {
  queryDepth += 1;
  try {
    return fn();
  } finally {
    queryDepth -= 1;
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Applies the current dev stub mode to a stub's return value.
 * normal: short delay, then `data`. slow: 3 s delay. empty: `empty` (or `data` when no empty value exists).
 * error: the error code chosen in the dev toolbar.
 */
export async function simulate<T>(data: T, empty?: T): Promise<Result<T>> {
  const dev = getDevState();
  const { errorCode } = dev;
  const mode = dev.scope === 'actions' && queryDepth > 0 ? 'normal' : dev.mode;
  await wait(mode === 'slow' ? SLOW_DELAY_MS : NORMAL_DELAY_MS);
  if (mode === 'error')
    return { ok: false, error: { code: errorCode, message: DEFAULT_MESSAGES[errorCode] } };
  if (mode === 'empty' && empty !== undefined) return { ok: true, data: empty };
  return { ok: true, data };
}
