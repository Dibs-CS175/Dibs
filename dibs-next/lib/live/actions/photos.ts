'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/actions/photos.ts checks it against the demo version.

import { randomUUID } from 'node:crypto';
import { fail, ok, type Result } from '@/lib/result';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PHOTO_BUCKET, checkPhoto, photoExtension } from '@/lib/photos';

/**
 * Uploads one photo (form field `file`) to Supabase Storage and returns its public URL.
 * Files go under `<user id>/` so storage policies can tie each file to its uploader.
 * Used by Sell and by Goods intake. Errors: NOT_SIGNED_IN, VALIDATION.
 */
export async function uploadPhoto(form: FormData): Promise<Result<{ url: string }>> {
  const file = form.get('file');
  if (!(file instanceof Blob)) return fail('VALIDATION', 'Pick a photo to upload.');
  const problem = checkPhoto(file);
  if (problem) return fail('VALIDATION', problem);

  const supabase = await createSupabaseServerClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return fail('NOT_SIGNED_IN', 'Sign in to upload photos.');

  const path = `${auth.user.id}/${randomUUID()}.${photoExtension(file.type)}`;
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) {
    // The bucket rejects wrong types and oversized files on its own; report those as fixable.
    if (/mime|size|too large|payload/i.test(error.message)) {
      return fail('VALIDATION', 'Use a JPEG, PNG or WebP photo under 5 MB.');
    }
    return fail('UNKNOWN', `Photo upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return ok({ url: data.publicUrl });
}
