'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { PackageOpen, Plus } from 'lucide-react';
import { GOODS_STATUSES, GoodsRow } from '@/components/admin/goods-row';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/states';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/field';
import { disposeGoods, listGoods, markGoodsSold } from '@/lib/actions/goods';
import { useQuery } from '@/lib/hooks';
import { getGoods } from '@/lib/queries/goods';
import { messageFor } from '@/lib/result';
import type { GoodsItem, GoodsStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const ERRORS = {
  DEADLINE_PASSED: 'This item is still in its hold period.',
  CONFLICT: 'This item changed. Reload to see the latest.',
};
const ACTIONS = {
  list: { fn: listGoods, done: 'Listed on Browse' },
  sold: { fn: markGoodsSold, done: 'Marked sold' },
  dispose: { fn: disposeGoods, done: 'Marked disposed' },
} as const;

export default function GoodsPage() {
  const [status, setStatus] = useState<GoodsStatus | undefined>(undefined);
  const { state, retry, setData } = useQuery(() => getGoods(status), [status]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const act = async (item: GoodsItem, a: keyof typeof ACTIONS) => {
    if (busy) return;
    setBusy(item.id);
    setError(null);
    const r = await ACTIONS[a].fn(item);
    setBusy(null);
    if (!r.ok) return setError(`${item.title}: ${messageFor(r.error, ERRORS)}`);
    if (state.status === 'data') setData(state.data.map((g) => (g.id === item.id ? r.data : g)));
    toast.success(ACTIONS[a].done);
  };

  const chip = (id: GoodsStatus | undefined, label: string) => (
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
        title="Goods inventory"
        subtitle="Items Dibs owns. New intake sits in a hold period before it can be listed."
        actions={
          <Button asChild>
            <Link href="/admin/goods/new">
              <Plus className="h-4 w-4" aria-hidden /> New intake
            </Link>
          </Button>
        }
      />
      <div
        role="group"
        aria-label="Filter by status"
        className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4"
      >
        {chip(undefined, 'All')}
        {GOODS_STATUSES.map((s) => chip(s.id, s.label))}
      </div>
      <FormError message={error} />
      {state.status === 'loading' ? (
        <ListSkeleton rows={6} />
      ) : state.status === 'error' ? (
        <ErrorState message={state.error.message} onRetry={retry} />
      ) : state.data.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          text="No items with this status."
          actionLabel="Add an intake"
          href="/admin/goods/new"
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {state.data.map((g) => (
            <GoodsRow key={g.id} item={g} pending={busy === g.id} onAction={(a) => act(g, a)} />
          ))}
        </ul>
      )}
    </>
  );
}
