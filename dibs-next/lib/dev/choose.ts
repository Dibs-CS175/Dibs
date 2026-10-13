import { fail, type Result } from '@/lib/result';
import { getDevState } from './state';

/**
 * Pairs a Demo function with its Live function. The returned function runs whichever one the data source
 * in the preview panel picks. Both must have the same signature, so TypeScript flags a Live function whose
 * parameters or return type drift from what the pages expect.
 *
 * If Live code throws (a bug, a database outage, a dropped connection), the screen gets an UNKNOWN error
 * instead of hanging on its loading state. The thrown error is logged to the browser console, and the
 * full stack trace appears in the terminal running `npm run dev`.
 */
export function choose<A extends unknown[], T>(
  demo: (...args: A) => Promise<Result<T>>,
  live: (...args: A) => Promise<Result<T>>,
): (...args: A) => Promise<Result<T>> {
  return async (...args: A) => {
    if (getDevState().source !== 'live') return demo(...args);
    try {
      return await live(...args);
    } catch (e) {
      console.error('[dibs] Live code threw', e);
      return fail('UNKNOWN', e instanceof Error ? e.message : String(e));
    }
  };
}
