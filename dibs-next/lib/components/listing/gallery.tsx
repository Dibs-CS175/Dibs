'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { ListingPhoto } from './listing-photo';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Gallery({ photos, title }: { photos: string[]; title: string }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const n = photos.length || 1;
  const go = (k: number) => setI((k + n) % n);
  const nav =
    'absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#14201a] shadow-1';
  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative"
        role="region"
        aria-roledescription="carousel"
        aria-label={`${title} photos`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(i + 1);
          if (e.key === 'ArrowLeft') go(i - 1);
        }}
      >
        <ListingPhoto
          src={photos[i] ?? 'ph:Package:0'}
          alt={`${title}, photo ${i + 1} of ${n}`}
          className="aspect-[4/5] w-full rounded-card md:aspect-square"
        />
        {n > 1 ? (
          <>
            <button
              type="button"
              className={cn(nav, 'left-3')}
              onClick={() => go(i - 1)}
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              className={cn(nav, 'right-3')}
              onClick={() => go(i + 1)}
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </>
        ) : null}
        <button
          type="button"
          className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[#14201a] shadow-1"
          onClick={() => setZoom(true)}
          aria-label="Open full-size photo"
        >
          <ZoomIn className="h-5 w-5" aria-hidden />
        </button>
        <p className="sr-only" aria-live="polite">
          Photo {i + 1} of {n}
        </p>
      </div>
      <div className="flex gap-2" role="group" aria-label="Thumbnails">
        {photos.map((p, k) => (
          <button
            key={p}
            type="button"
            onClick={() => setI(k)}
            aria-label={`Show photo ${k + 1}`}
            aria-current={k === i}
            className={cn(
              'w-20 rounded-input border-2 p-0.5',
              k === i ? 'border-grove' : 'border-transparent',
            )}
          >
            <ListingPhoto src={p} alt="" className="aspect-square w-full rounded-[8px]" />
          </button>
        ))}
      </div>
      <Sheet open={zoom} onOpenChange={setZoom}>
        <SheetContent title={`${title}, ${i + 1} of ${n}`}>
          <div className="flex flex-col gap-3">
            <ListingPhoto
              src={photos[i] ?? 'ph:Package:0'}
              alt={`${title}, photo ${i + 1}, enlarged`}
              className="aspect-square w-full rounded-card"
            />
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => go(i - 1)}>
                <ChevronLeft className="h-4 w-4" aria-hidden /> Previous
              </Button>
              <Button variant="secondary" onClick={() => go(i + 1)}>
                Next <ChevronRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
