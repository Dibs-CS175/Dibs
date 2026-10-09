import { cn } from '@/lib/utils';

/** Display-only bar. `value` and `max` come from query results; this component does no math beyond drawing. */
function Progress({
  value,
  max,
  label,
  className,
}: {
  value: number;
  max: number;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-sunk', className)}
    >
      <div
        className="h-full rounded-full bg-grove transition-[width] duration-320"
        style={{ width: max ? `${(value / max) * 100}%` : '0%' }}
      />
    </div>
  );
}

export { Progress };
