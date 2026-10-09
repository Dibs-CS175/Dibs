'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Flag } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/states';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { resolveReport } from '@/lib/actions/reports';
import { formatDateTime } from '@/lib/format';
import { useAction, useQuery } from '@/lib/hooks';
import { getOpenReports } from '@/lib/queries/reports';

export default function ReportsPage() {
  const { state, retry, setData } = useQuery(() => getOpenReports(), []);
  const resolve = useAction(resolveReport);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [active, setActive] = useState<string | null>(null);

  return (
    <>
      <PageHeader title="Reports" subtitle="Open problem reports. Resolving one records your note." />
      {state.status === 'loading' ? (
        <ListSkeleton rows={4} />
      ) : state.status === 'error' ? (
        <ErrorState message={state.error.message} onRetry={retry} />
      ) : state.data.length === 0 ? (
        <EmptyState icon={Flag} text="No open reports." actionLabel="Reload" onAction={retry} />
      ) : (
        <ul className="flex flex-col gap-3">
          {state.data.map(({ report: r, subject }) => (
            <li key={r.id} className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
              <div className="flex flex-col gap-1">
                <span className="font-semibold">{r.reason}</span>
                <span className="text-sm text-muted">
                  {subject} · {formatDateTime(r.createdAt)}
                </span>
              </div>
              <label htmlFor={`note-${r.id}`} className="sr-only">
                Resolution note for {subject}
              </label>
              <Textarea
                id={`note-${r.id}`}
                rows={2}
                placeholder="Resolution note"
                value={notes[r.id] ?? ''}
                onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
              />
              {active === r.id ? <FormError message={resolve.error?.message ?? null} /> : null}
              <Button
                className="w-fit"
                disabled={resolve.pending || !(notes[r.id] ?? '').trim()}
                onClick={async () => {
                  setActive(r.id);
                  const res = await resolve.run(r.id, notes[r.id] ?? '');
                  if (res?.ok) {
                    setData(state.data.filter((x) => x.report.id !== r.id));
                    toast.success('Report resolved');
                  }
                }}
              >
                {resolve.pending && active === r.id ? 'Resolving…' : 'Resolve'}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
