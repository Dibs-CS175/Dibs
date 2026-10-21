import type { ErrorCode } from '@/lib/result';

/** The one place error codes become words. Screens pass overrides where a code needs specific copy. */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  NOT_SIGNED_IN: 'Sign in to continue.',
  NOT_EDU: 'Use your campus email. It ends in .edu.',
  FORBIDDEN: 'You don’t have access to this.',
  NOT_FOUND: 'We couldn’t find that.',
  VALIDATION: 'Some fields need another look.',
  CONFLICT: 'Someone else changed this first. Refresh and try again.',
  RATE_LIMITED: 'Too many tries. Wait a minute and try again.',
  CODE_INVALID: 'That code doesn’t match.',
  ATTEMPTS_EXCEEDED: 'Too many wrong codes. This is locked for now.',
  PAYMENT_FAILED: 'Your card was declined. Try another card.',
  SLOT_FULL: 'That time just filled up. Pick another one.',
  DEADLINE_PASSED: 'The deadline for this has passed.',
  REFERRAL_INVALID: 'That referral code isn’t valid.',
  NOT_IMPLEMENTED: 'This part isn’t built yet.',
  UNKNOWN: 'Something went wrong. Try again.',
};

export type ErrorOverrides = Partial<Record<ErrorCode, string>>;

/**
 * NOT_IMPLEMENTED comes from a Live stub. Its message names the function and file, so it is shown as it is
 * to tell the team what to build next.
 * CODE_INVALID adds how many tries are left when the screen passes attemptsLeft.
 */
export function errorMessage(
  error: { code: ErrorCode; message?: string },
  overrides: ErrorOverrides = {},
  opts: { attemptsLeft?: number } = {},
): string {
  if (error.code === 'NOT_IMPLEMENTED' && error.message) return error.message;

  const base = overrides[error.code] ?? ERROR_MESSAGES[error.code];

  if (error.code === 'CODE_INVALID' && opts.attemptsLeft !== undefined) {
    const n = opts.attemptsLeft;
    return `${base} ${n} ${n === 1 ? 'try' : 'tries'} left.`;
  }

  return base;
}
