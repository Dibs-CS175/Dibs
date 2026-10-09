import Link from 'next/link';
import { AlertTriangle, RefreshCw, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function EmptyState({
  icon: Icon,
  text,
  actionLabel,
  onAction,
  href,
  className,
}: {
  icon: LucideIcon;
  text: string;
  actionLabel: string;
  onAction?: () => void;
  href?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-surface px-6 py-10 text-center',
        className,
      )}
    >
      <span className="grid h-12 w-12 place-items-center rounded-full bg-sunk text-muted">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <p className="max-w-sm text-base">{text}</p>
      {href ? (
        <Button asChild variant="secondary">
          <Link href={href}>{actionLabel}</Link>
        </Button>
      ) : (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  title,
  message,
  onRetry,
  className,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center gap-3 rounded-card border border-line bg-surface px-6 py-10 text-center',
        className,
      )}
    >
      <span className="grid h-12 w-12 place-items-center rounded-full bg-error-bg text-error">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </span>
      {title ? <p className="font-display text-xl font-bold">{title}</p> : null}
      <p className="max-w-sm text-base">{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" aria-hidden /> Retry
        </Button>
      ) : null}
    </div>
  );
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
      aria-busy="true"
      aria-label="Loading"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="aspect-[4/5] w-full rounded-card" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-card" />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="container flex flex-col gap-4 py-10" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-64 w-full rounded-card" />
    </div>
  );
}
