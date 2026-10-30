'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  GripVertical,
  ImagePlus,
  Loader2,
  RotateCw,
  Trash2,
} from 'lucide-react';
import { ListingPhoto } from '@/components/listing/listing-photo';
import { Button } from '@/components/ui/button';
import { uploadPhoto } from '@/lib/actions/photos';
import { useDevState } from '@/lib/dev/state';
import { errorMessage } from '@/lib/errorMessages';
import { PHOTO_MAX_BYTES, PHOTO_MAX_SIDE, PHOTO_TYPES, checkPhoto } from '@/lib/photos';
import { cn } from '@/lib/utils';

const move = <T,>(list: T[], from: number, to: number): T[] => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  if (item !== undefined) next.splice(to, 0, item);
  return next;
};

const UPLOAD_ERRORS = {
  VALIDATION: 'Use a JPEG, PNG or WebP photo under 5 MB.',
  NOT_SIGNED_IN: 'Your session ended. Sign in again to upload photos.',
};

/**
 * Shrinks big photos in the browser before upload (longest side PHOTO_MAX_SIDE, JPEG), so phone
 * pictures stay well under the size limit and load fast on listing cards. Small files pass through.
 */
async function prepare(file: File): Promise<Blob> {
  if (!(PHOTO_TYPES as readonly string[]).includes(file.type)) return file;
  if (file.size < 800 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

interface Pending {
  key: string;
  file: File;
  preview: string;
  status: 'uploading' | 'error';
  error?: string;
}

/**
 * Photo picker used by Sell and Goods intake. Uploads each photo as soon as it is picked
 * (Supabase Storage in Live, a local object URL in Demo) and only hands finished URLs to the form.
 * Each photo shows uploading, failed (with Retry) and done states. Drag or the arrow buttons reorder;
 * the first photo is the cover. `onPendingChange` reports how many are still uploading so the form
 * can hold Next / Submit until they finish.
 */
export function PhotoUpload({
  photos,
  onChange,
  onPendingChange,
  max = 8,
  label = 'Add photos',
}: {
  photos: string[];
  onChange: (p: string[]) => void;
  onPendingChange?: (uploading: number) => void;
  max?: number;
  label?: string;
}) {
  const dev = useDevState();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [announce, setAnnounce] = useState('');
  const [pending, setPending] = useState<Pending[]>([]);
  const [pickError, setPickError] = useState<string | null>(null);

  // Uploads can finish in any order; read the latest list so none overwrite each other.
  const latest = useRef(photos);
  latest.current = photos;

  const uploading = pending.filter((p) => p.status === 'uploading').length;
  useEffect(() => onPendingChange?.(uploading), [uploading, onPendingChange]);

  // Free local previews when the component goes away.
  const previews = useRef(new Set<string>());
  useEffect(() => {
    const set = previews.current;
    return () => set.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const room = max - photos.length - pending.length;

  const upload = async (item: Pending) => {
    const body = new FormData();
    body.append('file', await prepare(item.file), item.file.name);
    const r = await uploadPhoto(body);
    if (r.ok) {
      const next = [...latest.current, r.data.url];
      latest.current = next;
      onChange(next);
      URL.revokeObjectURL(item.preview);
      previews.current.delete(item.preview);
      setPending((list) => list.filter((p) => p.key !== item.key));
      setAnnounce(`Photo ${next.length} uploaded.`);
    } else {
      const msg = errorMessage(r.error, UPLOAD_ERRORS);
      setPending((list) => list.map((p) => (p.key === item.key ? { ...p, status: 'error', error: msg } : p)));
      setAnnounce(`A photo didn’t upload. ${msg}`);
    }
  };

  const add = (files: File[]) => {
    setPickError(null);
    const fits = files.slice(0, Math.max(0, room));
    if (files.length > fits.length) setPickError(`You can add up to ${max} photos.`);
    const accepted: Pending[] = [];
    for (const file of fits) {
      const problem = checkPhoto(file);
      if (problem) {
        setPickError(`${file.name}: ${problem}`);
        continue;
      }
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      accepted.push({ key: `${preview}`, file, preview, status: 'uploading' });
    }
    if (!accepted.length) return;
    setPending((list) => [...list, ...accepted]);
    accepted.forEach((item) => void upload(item));
  };

  const retry = (item: Pending) => {
    const again = { ...item, status: 'uploading' as const, error: undefined };
    setPending((list) => list.map((p) => (p.key === item.key ? again : p)));
    void upload(again);
  };

  const discard = (item: Pending) => {
    URL.revokeObjectURL(item.preview);
    previews.current.delete(item.preview);
    setPending((list) => list.filter((p) => p.key !== item.key));
  };

  const reorder = (from: number, to: number) => {
    if (to < 0 || to >= photos.length || from === to) return;
    onChange(move(photos, from, to));
    setAnnounce(`Photo ${from + 1} moved to position ${to + 1}${to === 0 ? ', now the cover' : ''}.`);
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileRef}
        type="file"
        accept={PHOTO_TYPES.join(',')}
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          add(Array.from(e.target.files ?? []));
          e.target.value = '';
        }}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={room <= 0}
          onClick={() => fileRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4" aria-hidden /> {label}
        </Button>
        {dev.source === 'demo' ? (
          <Button
            type="button"
            variant="ghost"
            disabled={room <= 0}
            onClick={() => onChange([...photos, `ph:Package:${photos.length}`])}
          >
            Use a sample photo
          </Button>
        ) : null}
      </div>
      <p className="text-sm text-muted">
        {photos.length} of {max}
        {uploading ? `, ${uploading} uploading` : ''}. JPEG, PNG or WebP, up to{' '}
        {Math.round(PHOTO_MAX_BYTES / 1024 / 1024)} MB each. The first photo is the cover.
      </p>
      {pickError ? (
        <p role="alert" className="text-sm text-error">
          {pickError}
        </p>
      ) : null}
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
      {photos.length || pending.length ? (
        <ol className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {photos.map((p, i) => (
            <li
              key={`${p}-${i}`}
              draggable
              onDragStart={() => setDragFrom(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragFrom !== null) reorder(dragFrom, i);
                setDragFrom(null);
              }}
              onDragEnd={() => setDragFrom(null)}
              className={cn(
                'flex flex-col gap-1 rounded-card border border-line bg-surface p-2',
                dragFrom === i && 'opacity-50',
              )}
            >
              <div className="relative">
                <ListingPhoto src={p} alt={`Photo ${i + 1}`} className="aspect-square w-full rounded-input" />
                {i === 0 ? (
                  <span className="absolute left-1 top-1 rounded-full bg-grove px-2 py-0.5 text-xs font-semibold text-on-grove">
                    Cover
                  </span>
                ) : null}
                <GripVertical
                  className="absolute right-1 top-1 h-5 w-5 cursor-grab rounded bg-surface/80 text-muted"
                  aria-hidden
                />
              </div>
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Move photo ${i + 1} up`}
                  disabled={i === 0}
                  onClick={() => reorder(i, i - 1)}
                >
                  <ArrowUp className="h-4 w-4" aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Move photo ${i + 1} down`}
                  disabled={i === photos.length - 1}
                  onClick={() => reorder(i, i + 1)}
                >
                  <ArrowDown className="h-4 w-4" aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove photo ${i + 1}`}
                  onClick={() => onChange(photos.filter((_, n) => n !== i))}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </li>
          ))}
          {pending.map((item) => (
            <li
              key={item.key}
              className={cn(
                'flex flex-col gap-1 rounded-card border bg-surface p-2',
                item.status === 'error' ? 'border-error' : 'border-line',
              )}
            >
              <div className="relative">
                <ListingPhoto
                  src={item.preview}
                  alt={item.file.name}
                  className={cn(
                    'aspect-square w-full rounded-input',
                    item.status === 'uploading' && 'opacity-50',
                  )}
                />
                <span className="absolute inset-0 grid place-items-center">
                  {item.status === 'uploading' ? (
                    <span className="flex items-center gap-1 rounded-full bg-surface/90 px-2 py-1 text-xs font-semibold">
                      <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" aria-hidden />
                      Uploading
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-surface/90 px-2 py-1 text-xs font-semibold text-error">
                      <AlertCircle className="h-3.5 w-3.5" aria-hidden /> Failed
                    </span>
                  )}
                </span>
              </div>
              {item.status === 'error' ? (
                <>
                  <p className="text-xs text-error">{item.error}</p>
                  <div className="flex justify-between">
                    <Button type="button" variant="ghost" size="sm" onClick={() => retry(item)}>
                      <RotateCw className="h-4 w-4" aria-hidden /> Retry
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${item.file.name}`}
                      onClick={() => discard(item)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                </>
              ) : (
                <p className="truncate text-xs text-muted">{item.file.name}</p>
              )}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
