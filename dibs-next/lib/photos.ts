// Photo rules shared by the upload component (browser) and lib/live/actions/photos.ts (server).
// The Supabase bucket enforces the same limits (supabase/migrations/20261026000100_photo_storage.sql),
// so keep the three in sync.

export const PHOTO_BUCKET = 'listing-photos';
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

/** Longest side after resizing in the browser. Keeps phone photos well under the size limit. */
export const PHOTO_MAX_SIDE = 1600;

const EXT: Record<(typeof PHOTO_TYPES)[number], string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function isPhotoType(type: string): type is (typeof PHOTO_TYPES)[number] {
  return (PHOTO_TYPES as readonly string[]).includes(type);
}

export function photoExtension(type: string): string {
  return isPhotoType(type) ? EXT[type] : 'jpg';
}

/** Returns what's wrong with the file in words a student can act on, or null when it's fine. */
export function checkPhoto(file: { type: string; size: number }): string | null {
  if (!isPhotoType(file.type)) return 'Use a JPEG, PNG or WebP photo.';
  if (file.size > PHOTO_MAX_BYTES) return 'That photo is over 5 MB. Try a smaller one.';
  if (file.size === 0) return 'That file is empty. Pick another photo.';
  return null;
}
