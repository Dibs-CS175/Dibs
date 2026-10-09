import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { BinView } from '@/lib/types';

export function BinCard({ bin }: { bin: BinView }) {
  return (
    <article className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-sans text-base font-bold">{bin.label}</h3>
        {bin.isFull ? <Badge variant="error">Full</Badge> : <Badge variant="success">Open</Badge>}
      </div>
      <Progress value={bin.used} max={bin.capacity} label={`${bin.label} capacity`} />
      <p className="tabular text-sm text-muted">
        {bin.used} of {bin.capacity} spaces used
      </p>
      {bin.items.length ? (
        <ul className="flex flex-wrap gap-1">
          {bin.items.map((i) => (
            <li key={i.id}>
              <Badge variant="outline">{i.label}</Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">Empty</p>
      )}
    </article>
  );
}
