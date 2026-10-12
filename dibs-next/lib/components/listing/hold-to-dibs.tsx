'use client';

import { useEffect, useRef, useState } from 'react';
import { Hand, MousePointerClick } from 'lucide-react';
import { HOLD_TO_DIBS_MS } from '@/lib/config/app';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { cn } from '@/lib/utils';

/**
 * Hold to Dibs: press and hold for HOLD_TO_DIBS_MS to fill the ring, then `onComplete` fires.
 * Releasing early drains the ring. Keyboard users and reduced-motion users get tap, then confirm:
 * the same `onComplete`, which opens the confirmation sheet.
 */
export function HoldToDibs({
  onComplete,
  mode,
  disabled,
  label = 'Hold to Dibs',
}: {
  onComplete: () => void;
  mode: 'hold' | 'tap';
  disabled?: boolean;
  label?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const tap = mode === 'tap' || reduced;
  const [progress, setProgress] = useState(0);
  const raf = useRef<number>();
  const start = useRef(0);
  const holding = useRef(false);

  useEffect(() => () => cancelAnimationFrame(raf.current ?? 0), []);

  const tick = (t: number) => {
    if (!holding.current) return;
    const p = Math.min(1, (t - start.current) / HOLD_TO_DIBS_MS);
    setProgress(p);
    if (p >= 1) {
      holding.current = false;
      onComplete();
      setTimeout(() => setProgress(0), 300);
      return;
    }
    raf.current = requestAnimationFrame(tick);
  };

  const begin = () => {
    if (disabled || holding.current) return;
    holding.current = true;
    start.current = performance.now();
    raf.current = requestAnimationFrame(tick);
  };

  const release = () => {
    if (!holding.current) return;
    holding.current = false;
    cancelAnimationFrame(raf.current ?? 0);
    setProgress(0);
  };

  const base =
    'relative inline-flex min-h-[56px] w-full select-none items-center justify-center gap-2 rounded-full bg-navel font-display text-xl font-extrabold text-on-accent disabled:opacity-50';

  if (tap) {
    return (
      <div className="flex flex-col gap-1">
        <button type="button" className={base} onClick={onComplete} disabled={disabled}>
          <MousePointerClick className="h-5 w-5" aria-hidden /> {label.replace('Hold to', 'Tap to')}
        </button>
        <p className="text-center text-xs text-muted">Tap, then confirm.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <svg
          className="pointer-events-none absolute -inset-[5px] h-[calc(100%+10px)] w-[calc(100%+10px)] overflow-visible"
          aria-hidden="true"
        >
          <rect
            x="1.5"
            y="1.5"
            rx="31.5"
            fill="none"
            stroke="var(--line)"
            strokeWidth="3"
            style={{ width: 'calc(100% - 3px)', height: 'calc(100% - 3px)' }}
          />
          <rect
            x="1.5"
            y="1.5"
            rx="31.5"
            fill="none"
            stroke="var(--grove)"
            strokeWidth="3"
            pathLength={1}
            strokeDasharray="1 1"
            style={{
              strokeDashoffset: 1 - progress,
              width: 'calc(100% - 3px)',
              height: 'calc(100% - 3px)',
              transition: holding.current ? 'none' : 'stroke-dashoffset 200ms',
            }}
          />
        </svg>
        <button
          type="button"
          disabled={disabled}
          className={cn(base, 'touch-none')}
          onPointerDown={(e) => {
            if (e.button === 0) begin();
          }}
          onPointerUp={release}
          onPointerLeave={release}
          onPointerCancel={release}
          onContextMenu={(e) => e.preventDefault()}
          onClick={(e) => {
            // Keyboard activation (Enter or Space) falls back to tap, then confirm.
            if (e.detail === 0) onComplete();
          }}
          aria-describedby="hold-help"
        >
          <Hand className="h-5 w-5" aria-hidden /> {label}
        </button>
      </div>
      <p id="hold-help" className="text-center text-xs text-muted">
        Press and hold until the ring fills. Using a keyboard? Press Enter, then confirm.
      </p>
    </div>
  );
}
