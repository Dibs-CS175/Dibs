'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/** Six boxes: auto-advance, Backspace goes back, and pasting a full code fills every box. */
export function CodeInput({
  value,
  onChange,
  invalid,
  disabled,
  describedBy,
}: {
  value: string[];
  onChange: (digits: string[]) => void;
  invalid?: boolean;
  disabled?: boolean;
  describedBy?: string;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const fill = (start: number, text: string) => {
    const digits = text
      .replace(/\D/g, '')
      .slice(0, 6 - start)
      .split('');
    if (!digits.length) return;
    const next = [...value];
    digits.forEach((d, k) => {
      next[start + k] = d;
    });
    onChange(next);
    refs.current[Math.min(5, start + digits.length)]?.focus();
  };

  return (
    <div
      className="flex gap-2 md:gap-3"
      onPaste={(e) => {
        e.preventDefault();
        const i = refs.current.findIndex((r) => r === document.activeElement);
        fill(Math.max(0, i), e.clipboardData.getData('text'));
      }}
    >
      {value.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={6}
          aria-label={`Digit ${i + 1} of 6`}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '');
            if (v.length > 1) return fill(i, v);
            const next = [...value];
            next[i] = v;
            onChange(next);
            if (v && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !value[i] && i > 0) {
              e.preventDefault();
              const next = [...value];
              next[i - 1] = '';
              onChange(next);
              refs.current[i - 1]?.focus();
            }
            if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
            if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus();
          }}
          className={cn(
            'tabular h-14 w-full min-w-0 rounded-input border bg-surface text-center font-display text-3xl font-extrabold text-ink md:h-16',
            invalid ? 'border-error' : 'border-line',
          )}
        />
      ))}
    </div>
  );
}
