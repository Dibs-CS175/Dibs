'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PanelsTopLeft, Wrench, X } from 'lucide-react';
import { useDevState } from '@/lib/dev/state';
import { DevControls, devSummary } from './dev-controls';

/** Dev-only floating panel. Rendered when NEXT_PUBLIC_DEV_TOOLBAR=true. The full version lives at /dev. */
export function DevToolbar() {
  const dev = useDevState();
  const [open, setOpen] = useState(false);
  const summary = devSummary(dev);

  return (
    <div className="fixed bottom-3 left-3 z-[70] text-ink">
      {open ? (
        <div
          role="region"
          aria-label="Dev toolbar"
          className="w-64 rounded-card border border-line bg-surface p-3 shadow-2"
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Dev toolbar</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close dev toolbar"
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-sunk"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <DevControls />
          <Link
            href="/dev"
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex min-h-[36px] items-center gap-2 text-sm font-semibold underline underline-offset-2"
          >
            <PanelsTopLeft className="h-4 w-4" aria-hidden /> Open preview panel
          </Link>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-[40px] max-w-[calc(100vw-24px)] items-center gap-2 truncate rounded-full border border-line bg-surface px-3 text-xs font-bold shadow-2"
          aria-label={`Open dev toolbar. ${summary}`}
        >
          <Wrench className="h-4 w-4 shrink-0" aria-hidden /> {summary}
        </button>
      )}
    </div>
  );
}
