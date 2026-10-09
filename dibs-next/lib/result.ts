export type ErrorCode =
  | 'NOT_SIGNED_IN'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'PAYMENT_FAILED'
  | 'SLOT_FULL'
  | 'DEADLINE_PASSED'
  | 'CAPACITY_FULL'
  | 'CODE_INVALID'
  | 'UNKNOWN';

export type Result<T> = { ok: true; data: T } | { ok: false; error: { code: ErrorCode; message: string } };

export const ERROR_CODES: ErrorCode[] = [
  'NOT_SIGNED_IN',
  'FORBIDDEN',
  'NOT_FOUND',
  'VALIDATION',
  'CONFLICT',
  'RATE_LIMITED',
  'PAYMENT_FAILED',
  'SLOT_FULL',
  'DEADLINE_PASSED',
  'CAPACITY_FULL',
  'CODE_INVALID',
  'UNKNOWN',
];

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function fail<T = never>(code: ErrorCode, message: string): Result<T> {
  return { ok: false, error: { code, message } };
}

/** Pick a screen-specific message for an error code, falling back to the server message. */
export function messageFor(
  error: { code: ErrorCode; message: string },
  map: Partial<Record<ErrorCode, string>>,
): string {
  return map[error.code] ?? error.message;
}
