'use client';

import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, GripVertical, ImagePlus, Trash2 } from 'lucide-react';
import { ListingPhoto } from '@/components/listing/listing-photo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const move = <T,>(list: T[], from: number, to: number): T[] => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  if (item !== undefined) next.splice(to, 0, item);
  return next;
};

/**
 * Photo list with drag to reorder and Move up / Move down buttons as the non-drag alternative.
 * The first photo is the cover. Files become local object URLs; uploading is the backend's job.
 */
export function PhotoOrderer({
  photos,
  onChange,
  max = 8,
}: {
  photos: string[];
  onChange: (p: string[]) => void;
  max?: number;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [announce, setAnnounce] = useState('');

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
        accept="image/*"
        multiple
        className="sr-only"
        id="photo-input"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []).slice(0, max - photos.length);
          onChange([...photos, ...files.map((f) => URL.createObjectURL(f))]);
          e.target.value = '';
        }}
      />
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" disabled={photos.length >= max} onClick={() => fileRef.current?.click()}>
          <ImagePlus className="h-4 w-4" aria-hidden /> Add photos
        </Button>
        <Button
          variant="ghost"
          disabled={photos.length >= max}
          onClick={() => onChange([...photos, `ph:Package:${photos.length}`])}
        >
          Use a sample photo
        </Button>
      </div>
      <p className="text-sm text-muted">
        {photos.length} of {max}. The first photo is the cover. Drag to reorder or use the arrows.
      </p>
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
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
                variant="ghost"
                size="icon"
                aria-label={`Move photo ${i + 1} up`}
                disabled={i === 0}
                onClick={() => reorder(i, i - 1)}
              >
                <ArrowUp className="h-4 w-4" aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Move photo ${i + 1} down`}
                disabled={i === photos.length - 1}
                onClick={() => reorder(i, i + 1)}
              >
                <ArrowDown className="h-4 w-4" aria-hidden />
              </Button>
              <Button
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
      </ol>
    </div>
  );
}
