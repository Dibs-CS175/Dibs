export type ErrorCode =
  | 'NOT_SIGNED_IN'
  | 'NOT_EDU'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'CODE_INVALID'
  | 'ATTEMPTS_EXCEEDED'
  | 'PAYMENT_FAILED'
  | 'SLOT_FULL'
  | 'DEADLINE_PASSED'
  | 'REFERRAL_INVALID'
  | 'NOT_IMPLEMENTED'
  | 'UNKNOWN';

export type Result<T> = { ok: true; data: T } | { ok: false; error: { code: ErrorCode; message: string } };

export const ERROR_CODES: ErrorCode[] = [
  'NOT_SIGNED_IN',
  'NOT_EDU',
  'FORBIDDEN',
  'NOT_FOUND',
  'VALIDATION',
  'CONFLICT',
  'RATE_LIMITED',
  'CODE_INVALID',
  'ATTEMPTS_EXCEEDED',
  'PAYMENT_FAILED',
  'SLOT_FULL',
  'DEADLINE_PASSED',
  'REFERRAL_INVALID',
  'NOT_IMPLEMENTED',
  'UNKNOWN',
];

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function fail<T = never>(code: ErrorCode, message: string): Result<T> {
  return { ok: false, error: { code, message } };
}
