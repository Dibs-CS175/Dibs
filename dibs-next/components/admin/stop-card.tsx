import Link from 'next/link';
import { Check, ClipboardCheck, MapPin, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatWindow } from '@/lib/format';
import type { RouteStopView } from '@/lib/types';

export function StopCard({
  stop,
  onMark,
  pending,
}: {
  stop: RouteStopView;
  onMark: (status: 'done' | 'missed') => void;
  pending: boolean;
}) {
  return (
    <article className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1 font-semibold">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden /> {stop.address}
          </span>
          <span className="text-sm text-muted">{formatWindow(stop.window.startsAt, stop.window.endsAt)}</span>
        </div>
        <Badge variant={stop.status === 'done' ? 'success' : stop.status === 'missed' ? 'error' : 'outline'}>
          {stop.status === 'done' ? 'Done' : stop.status === 'missed' ? 'Missed' : 'Pending'}
        </Badge>
      </div>
      <ul className="flex flex-wrap gap-1">
        {stop.items.map((i) => (
          <li key={i.id}>
            <Badge variant={i.size === 'large' ? 'default' : 'outline'}>
              {i.label}
              {i.size === 'large' ? ' (large)' : ''}
            </Badge>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={pending || stop.status === 'done'} onClick={() => onMark('done')}>
          <Check className="h-4 w-4" aria-hidden /> Done
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={pending || stop.status === 'missed'}
          onClick={() => onMark('missed')}
        >
          <X className="h-4 w-4" aria-hidden /> Missed
        </Button>
        <Button asChild size="sm" variant="secondary">
          <Link href={`/admin/check-in/${stop.id}`}>
            <ClipboardCheck className="h-4 w-4" aria-hidden /> Check in items
          </Link>
        </Button>
      </div>
    </article>
  );
}
