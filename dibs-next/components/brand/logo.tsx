import { cn } from '@/lib/utils';

/** Rounded price tag in navel with a grove leaf at the string hole. */
export function Mark({
  size = 32,
  mono = false,
  className,
}: {
  size?: number;
  mono?: boolean;
  className?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path
        d="M14.2 4h9.3A4.5 4.5 0 0 1 28 8.5v9.3a3 3 0 0 1-.9 2.1l-8.6 8.6a3.2 3.2 0 0 1-4.5 0l-8.8-8.8a3.2 3.2 0 0 1 0-4.5l8.6-8.6A3 3 0 0 1 14.2 4Z"
        fill={mono ? 'currentColor' : 'var(--navel)'}
      />
      <circle cx="22.4" cy="9.6" r="2.1" fill="var(--peel)" />
      <path
        d="M23.4 8.6c1.2-3.3 3.9-4.9 7-4.9-.2 3.2-2.3 5.7-5.6 6.2l-1.4-1.3Z"
        fill={mono ? 'currentColor' : 'var(--grove)'}
      />
    </svg>
  );
}

/** Orange cross-section that replaces the dot on the i. */
function Segment({ cut }: { cut: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className="absolute left-1/2 top-[0.02em] h-[0.3em] w-[0.3em] -translate-x-1/2"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="9.5" fill="var(--navel)" />
      <g stroke={cut} strokeWidth="1.6" strokeLinecap="round">
        <line x1="10" y1="10" x2="10" y2="2.5" />
        <line x1="10" y1="10" x2="16.5" y2="13.8" />
        <line x1="10" y1="10" x2="3.5" y2="13.8" />
      </g>
    </svg>
  );
}

export function Logo({
  size = 26,
  onDark = false,
  className,
}: {
  size?: number;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)} role="img" aria-label="Dibs">
      <Mark size={size * 1.1} />
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex items-baseline font-display font-extrabold leading-none',
          onDark ? 'text-white' : 'text-ink',
        )}
        style={{ fontSize: size, letterSpacing: '-0.02em' }}
      >
        d
        <span className="relative inline-block">
          ı<Segment cut={onDark ? 'var(--grove)' : 'var(--peel)'} />
        </span>
        bs
      </span>
    </span>
  );
}
