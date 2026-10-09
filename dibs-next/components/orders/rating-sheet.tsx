'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { FormError } from '@/components/ui/field';
import { RATING_TAGS } from '@/lib/config/app';
import { cn } from '@/lib/utils';

export function RatingSheet({
  open,
  onOpenChange,
  name,
  onSubmit,
  pending,
  error,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  name: string;
  onSubmit: (stars: number, tags: string[]) => void;
  pending: boolean;
  error: string | null;
}) {
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        title={`Rate ${name}`}
        footer={
          <Button className="w-full" disabled={stars === 0 || pending} onClick={() => onSubmit(stars, tags)}>
            {pending ? 'Sending…' : 'Submit rating'}
          </Button>
        }
      >
        <div className="flex flex-col gap-5">
          <fieldset>
            <legend className="mb-2 font-semibold">How did it go?</legend>
            <div className="flex gap-1" role="radiogroup" aria-label="Stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={stars === n}
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  onClick={() => setStars(n)}
                  className="grid h-11 w-11 place-items-center rounded-full hover:bg-sunk"
                >
                  <Star
                    className={cn('h-7 w-7', n <= stars ? 'fill-zest text-rind' : 'text-muted')}
                    aria-hidden
                  />
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 font-semibold">Anything stand out? (optional)</legend>
            <div className="flex flex-wrap gap-2">
              {RATING_TAGS.map((t) => {
                const on = tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setTags(on ? tags.filter((x) => x !== t) : [...tags, t])}
                    className={cn(
                      'min-h-[44px] rounded-full border px-4 text-sm font-semibold',
                      on ? 'border-grove bg-grove text-on-grove' : 'border-line bg-surface',
                    )}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <FormError message={error} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
