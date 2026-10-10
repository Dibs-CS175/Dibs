'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Landmark } from 'lucide-react';
import { ConsignmentStatusBadge } from '@/components/consignment/consignment-status';
import { PageHeader } from '@/components/layout/page-header';
import { QuoteLines } from '@/components/listing/quote-lines';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/field';
import { markPayoutSent } from '@/lib/actions/consignment';
import { formatDate, shortName } from '@/lib/format';
import { useQuery } from '@/lib/hooks';
import { getPayouts } from '@/lib/queries/consignment';
import { messageFor } from '@/lib/result';
import { cn } from '@/lib/utils';

export default function PayoutsPage() {
  const { state, retry, setData } = useQuery(() => getPayouts(), []);
  const [view, setView] = useState<'pending' | 'sent'>('pending');
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // Grouping only: "pending" means the backend has not recorded a sent date.
  const rows =
    state.status === 'data'
      ? state.data.filter((c) => (view === 'pending' ? !c.payoutSentAt : Boolean(c.payoutSentAt)))
      : [];

  return (
    <>
      <PageHeader
        title="Payouts"
        subtitle="What each student is owed for sold consigned items, as calculated by the backend."
      />
      <div role="group" aria-label="Show" className="flex gap-2">
        {(['pending', 'sent'] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => setView(v)}
            className={cn(
              'min-h-[44px] rounded-full border px-4 text-sm font-semibold',
              view === v ? 'border-grove bg-grove text-on-grove' : 'border-line bg-surface',
            )}
          >
            {v === 'pending' ? 'To send' : 'Sent'}
          </button>
        ))}
      </div>
      {state.status === 'loading' ? (
        <ListSkeleton rows={3} />
      ) : state.status === 'error' ? (
        <ErrorState message={state.error.message} onRetry={retry} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Landmark}
          text={view === 'pending' ? 'No payouts waiting to be sent.' : 'No payouts sent yet.'}
          actionLabel="Reload"
          onAction={retry}
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {rows.map((c) => (
            <li
              key={c.item.id}
              className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-col">
                  <span className="font-semibold">{c.item.label}</span>
                  <span className="text-sm text-muted">To {shortName(c.owner)}</span>
                </div>
                <ConsignmentStatusBadge status={c.status} />
              </div>
              {c.payout ? <QuoteLines quote={c.payout} totalLabel="Payout" /> : null}
              {c.payoutMethod.status === 'set' ? (
                <p className="text-sm">Pays to {c.payoutMethod.label}</p>
              ) : (
                <Badge variant="error" className="w-fit">
                  Owner has no payout method
                </Badge>
              )}
              {c.payoutSentAt ? (
                <p className="text-sm text-success">Sent {formatDate(c.payoutSentAt)}</p>
              ) : null}
              <FormError message={errors[c.item.id] ?? null} />
              {!c.payoutSentAt ? (
                <Button
                  className="w-fit"
                  disabled={busy !== null || c.payoutMethod.status !== 'set'}
                  onClick={async () => {
                    setBusy(c.item.id);
                    setErrors((e) => ({ ...e, [c.item.id]: null }));
                    const r = await markPayoutSent(c.item.id);
                    setBusy(null);
                    if (!r.ok) {
                      setErrors((e) => ({
                        ...e,
                        [c.item.id]: messageFor(r.error, { CONFLICT: 'The owner has no payout method yet.' }),
                      }));
                      return;
                    }
                    if (state.status === 'data')
                      setData(state.data.map((x) => (x.item.id === c.item.id ? r.data : x)));
                    toast.success('Payout marked sent');
                  }}
                >
                  {busy === c.item.id ? 'Saving…' : 'Mark payout sent'}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
