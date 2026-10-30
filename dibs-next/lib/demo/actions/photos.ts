// DEMO versions: fixture-backed stand-ins shown when the data source is Demo (the default).
// They are the working mockup, not production code. Write real code in lib/live/actions/photos.ts.

import { simulate } from '@/lib/dev';
import { checkPhoto } from '@/lib/photos';
import { fail, type Result } from '@/lib/result';

/** Keeps the photo in the browser as an object URL. Errors: VALIDATION. */
export async function uploadPhoto(form: FormData): Promise<Result<{ url: string }>> {
  const file = form.get('file');
  if (!(file instanceof Blob)) return fail('VALIDATION', 'Pick a photo to upload.');
  const problem = checkPhoto(file);
  if (problem) return fail('VALIDATION', problem);
  return simulate({ url: URL.createObjectURL(file) });
}
