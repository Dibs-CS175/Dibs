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
  UNKNOWN: 'Something went wrong. Try again.',
};

export type ErrorOverrides = Partial<Record<ErrorCode, string>>;

export function errorMessage(error: { code: ErrorCode }, overrides: ErrorOverrides = {}): string {
  return overrides[error.code] ?? ERROR_MESSAGES[error.code];
}
