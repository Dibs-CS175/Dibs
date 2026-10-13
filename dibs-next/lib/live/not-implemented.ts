import { fail, type Result } from '@/lib/result';

/** What every Live stub returns until someone writes it. Screens show the message in their error state. */
export function notImplemented(name: string, file: string): Result<never> {
  return fail('NOT_IMPLEMENTED', `Not built yet: ${name} in ${file}.`);
}
