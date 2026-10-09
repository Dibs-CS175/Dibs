'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ChevronLeft, PackageX } from 'lucide-react';
import { CheckInItem } from '@/components/admin/check-in-item';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/states';
import { Button } from '@/components/ui/button';
import { checkInItem, markItemDamaged, refuseItem } from '@/lib/actions/logistics';
import { formatWindow } from '@/lib/format';
import { useQuery } from '@/lib/hooks';
import { getStop } from '@/lib/queries/logistics';
import { messageFor, type Result } from '@/lib/result';
import type { StorageItem } from '@/lib/types';

const ERRORS = {
  CAPACITY_FULL: 'That bin just filled up. Pick another bin.',
  CONFLICT: 'This item was already checked in.',
};

export default function CheckInPage({ params }: { params: { stopId: string } }) {
  const { state, retry, setData } = useQuery(() => getStop(params.stopId), [params.stopId]);
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // Items are handled one at a time but independently, so each keeps its own pending and error state.
  const run = async (item: StorageItem, call: () => Promise<Result<StorageItem>>, done: string) => {
    if (busy) return;
    setBusy(item.id);
    setErrors((e) => ({ ...e, [item.id]: null }));
    const r = await call();
    setBusy(null);
    if (!r.ok) {
      setErrors((e) => ({ ...e, [item.id]: messageFor(r.error, ERRORS) }));
      if (r.error.code === 'CAPACITY_FULL') retry();
      return;
    }
    if (state.status === 'data') {
      setData({
        ...state.data,
        stop: {
          ...state.data.stop,
          items: state.data.stop.items.map((i) => (i.id === item.id ? r.data : i)),
        },
      });
    }
    toast.success(done);
  };

  return (
    <>
      <Button asChild variant="link" className="w-fit px-0">
        <Link href="/admin/routes">
          <ChevronLeft className="h-4 w-4" aria-hidden /> Routes
        </Link>
      </Button>
      {state.status === 'loading' ? (
        <ListSkeleton rows={3} />
      ) : state.status === 'error' ? (
        state.error.code === 'NOT_FOUND' ? (
          <EmptyState
            icon={PackageX}
            text="That stop doesn’t exist."
            actionLabel="Back to routes"
            href="/admin/routes"
          />
        ) : (
          <ErrorState message={state.error.message} onRetry={retry} />
        )
      ) : (
        <>
          <PageHeader
            title={`Check-in: ${state.data.stop.building}`}
            subtitle={`${state.data.stop.address} · ${formatWindow(state.data.stop.window.startsAt, state.data.stop.window.endsAt)}`}
          />
          {state.data.stop.items.length === 0 ? (
            <EmptyState
              icon={PackageX}
              text="No items on this booking."
              actionLabel="Back to routes"
              href="/admin/routes"
            />
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {state.data.stop.items.map((item) => (
                <li key={item.id}>
                  <CheckInItem
                    item={item}
                    bins={state.data.bins}
                    pending={busy === item.id}
                    error={errors[item.id] ?? null}
                    onCheckIn={(v) =>
                      run(
                        item,
                        () =>
                          checkInItem(item, {
                            conditionPhoto: v.photo,
                            conditionNote: v.note,
                            binId: v.binId,
                          }),
                        `${item.label} checked in`,
                      )
                    }
                    onRefuse={(reason) => run(item, () => refuseItem(item, reason), `${item.label} refused`)}
                    onDamaged={(note) =>
                      run(item, () => markItemDamaged(item, note), `${item.label} marked damaged`)
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
