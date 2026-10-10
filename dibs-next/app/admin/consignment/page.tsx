'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { CalendarX, HandCoins } from 'lucide-react';
import { AdminConsignmentRow } from '@/components/consignment/admin-consignment-row';
import { CONSIGNMENT_STATUSES } from '@/components/consignment/consignment-status';
import { DamageSheet } from '@/components/consignment/damage-sheet';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/states';
import { SlotAvailability } from '@/components/summer-hold/slot-picker';
import { Skeleton } from '@/components/ui/skeleton';
import {
  moveUnsoldToGoods,
  publishConsignedListing,
  recordConsignmentDamage,
} from '@/lib/actions/consignment';
import { useQuery } from '@/lib/hooks';
import { getConsignmentQueue, getStoragePickupSlots } from '@/lib/queries/consignment';
import { messageFor, type Result } from '@/lib/result';
import type { ConsignmentAdminView, ConsignmentStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const ERRORS = {
  CONFLICT: 'This item changed or is still inside its listing period. Reload to see the latest.',
  VALIDATION: 'Some listing details need another look.',
};

export default function AdminConsignmentPage() {
  const [status, setStatus] = useState<ConsignmentStatus | undefined>('awaiting_listing');
  const { state, retry, setData } = useQuery(() => getConsignmentQueue(status), [status]);
  const windows = useQuery(() => getStoragePickupSlots(), []);
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [damageFor, setDamageFor] = useState<ConsignmentAdminView | null>(null);

  const run = async <T,>(
    view: ConsignmentAdminView,
    call: () => Promise<Result<T>>,
    apply: (d: T) => ConsignmentAdminView,
    done: string,
  ) => {
    if (busy) return false;
    setBusy(view.item.id);
    setErrors((e) => ({ ...e, [view.item.id]: null }));
    const r = await call();
    setBusy(null);
    if (!r.ok) {
      setErrors((e) => ({ ...e, [view.item.id]: messageFor(r.error, ERRORS) }));
      return false;
    }
    if (state.status === 'data')
      setData(state.data.map((c) => (c.item.id === view.item.id ? apply(r.data) : c)));
    toast.success(done);
    return true;
  };

  const chip = (id: ConsignmentStatus | undefined, label: string) => (
    <button
      key={label}
      type="button"
      aria-pressed={status === id}
      onClick={() => setStatus(id)}
      className={cn(
        'min-h-[44px] shrink-0 rounded-full border px-4 text-sm font-semibold',
        status === id ? 'border-grove bg-grove text-on-grove' : 'border-line bg-surface',
      )}
    >
      {label}
    </button>
  );

  return (
    <>
      <PageHeader
        title="Consignment"
        subtitle="Summer Hold items students asked Dibs to sell. Dibs is the seller of record."
      />
      <div
        role="group"
        aria-label="Filter by status"
        className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4"
      >
        {chip(undefined, 'All')}
        {CONSIGNMENT_STATUSES.map((s) => chip(s.id, s.label))}
      </div>
      {state.status === 'loading' ? (
        <ListSkeleton rows={4} />
      ) : state.status === 'error' ? (
        <ErrorState message={state.error.message} onRetry={retry} />
      ) : state.data.length === 0 ? (
        <EmptyState
          icon={HandCoins}
          text="No consigned items with this status."
          actionLabel="Show all"
          onAction={() => setStatus(undefined)}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {state.data.map((c) => (
            <AdminConsignmentRow
              key={c.item.id}
              view={c}
              pending={busy === c.item.id}
              error={errors[c.item.id] ?? null}
              onPublish={(input) =>
                void run(
                  c,
                  () => publishConsignedListing(c.item.id, input),
                  (l) => ({
                    ...c,
                    status: 'listed',
                    item: { ...c.item, listingId: l.id },
                    listing: {
                      id: l.id,
                      title: l.title,
                      photos: l.photos,
                      priceCents: l.priceCents,
                      status: l.status,
                    },
                  }),
                  'Listed on Browse',
                )
              }
              onMoveToGoods={() =>
                void run(
                  c,
                  () => moveUnsoldToGoods(c.item.id),
                  (d) => d,
                  'Moved to Dibs Goods',
                )
              }
              onDamage={() => setDamageFor(c)}
            />
          ))}
        </ul>
      )}

      <section aria-labelledby="win-h" className="flex flex-col gap-3">
        <h2 id="win-h" className="text-xl font-bold">
          Buyer pickup windows
        </h2>
        <p className="text-sm text-muted">
          Buyers of consigned items collect at the storage unit during these windows.
        </p>
        {windows.state.status === 'loading' ? (
          <Skeleton className="h-32 rounded-card" />
        ) : windows.state.status === 'error' ? (
          <ErrorState message={windows.state.error.message} onRetry={windows.retry} />
        ) : windows.state.data.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            text="No buyer pickup windows scheduled."
            actionLabel="Reload"
            onAction={windows.retry}
          />
        ) : (
          <SlotAvailability slots={windows.state.data} />
        )}
      </section>

      <DamageSheet
        key={damageFor?.item.id ?? 'none'}
        open={damageFor !== null}
        onOpenChange={(o) => !o && setDamageFor(null)}
        itemLabel={damageFor?.item.label ?? ''}
        pending={damageFor !== null && busy === damageFor.item.id}
        error={damageFor ? (errors[damageFor.item.id] ?? null) : null}
        onSubmit={async (cause, note) => {
          if (!damageFor) return;
          const okd = await run(
            damageFor,
            () => recordConsignmentDamage(damageFor.item.id, cause, note),
            (d) => d,
            'Damage recorded',
          );
          if (okd) setDamageFor(null);
        }}
      />
    </>
  );
}
