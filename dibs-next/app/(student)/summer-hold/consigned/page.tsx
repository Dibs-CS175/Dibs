'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { HandCoins } from 'lucide-react';
import { ConsignmentCard } from '@/components/consignment/consignment-card';
import { ACTIVE_CONSIGNMENT } from '@/components/consignment/consignment-status';
import { PayoutMethodCard } from '@/components/consignment/payout-method-card';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/states';
import { ConsignmentTermsSummary } from '@/components/summer-hold/consignment-terms';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { startPayoutSetup, updateConsignmentPrice, withdrawConsignment } from '@/lib/actions/consignment';
import { formatMoney } from '@/lib/format';
import { useAction, useQuery } from '@/lib/hooks';
import { getConsignmentTerms, getMyConsignments, getMyPayoutMethod } from '@/lib/queries/consignment';
import { messageFor, type Result } from '@/lib/result';
import type { ConsignmentView } from '@/lib/types';

export default function ConsignedItemsPage() {
  const { state, retry, setData } = useQuery(() => getMyConsignments(), []);
  const terms = useQuery(() => getConsignmentTerms(), []);
  const payout = useQuery(() => getMyPayoutMethod(), []);
  const setup = useAction(startPayoutSetup);
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const minPrice = terms.state.status === 'data' ? formatMoney(terms.state.data.minAskingPriceCents) : null;
  const ERRORS = {
    VALIDATION: minPrice ? `Asking prices start at ${minPrice}.` : 'That price is not allowed.',
    CONFLICT: 'This item already sold, so it can no longer be changed.',
    DEADLINE_PASSED: 'The listing period is over for this item.',
  };

  // Each item keeps its own pending and error state.
  const run = async (view: ConsignmentView, call: () => Promise<Result<ConsignmentView>>, done: string) => {
    if (busy) return;
    setBusy(view.item.id);
    setErrors((e) => ({ ...e, [view.item.id]: null }));
    const r = await call();
    setBusy(null);
    if (!r.ok) return setErrors((e) => ({ ...e, [view.item.id]: messageFor(r.error, ERRORS) }));
    if (state.status === 'data') setData(state.data.map((c) => (c.item.id === view.item.id ? r.data : c)));
    toast.success(done);
  };

  const list = (items: ConsignmentView[]) => (
    <ul className="grid gap-4 md:grid-cols-2">
      {items.map((c) => (
        <li key={c.item.id}>
          <ConsignmentCard
            view={c}
            pending={busy === c.item.id}
            error={errors[c.item.id] ?? null}
            onSavePrice={(cents) => run(c, () => updateConsignmentPrice(c.item.id, cents), 'Price updated')}
            onWithdraw={() =>
              run(c, () => withdrawConsignment(c.item.id), 'Withdrawn. It comes back with your fall return.')
            }
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="container flex max-w-content flex-col gap-8 py-8 md:py-12">
      <PageHeader
        title="Consigned items"
        subtitle="Items you asked Dibs to sell from Summer Hold. Dibs lists them, sells them and pays you your share."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <section aria-labelledby="terms-h" className="flex flex-col gap-2 rounded-card bg-sunk p-4">
          <h2 id="terms-h" className="font-sans text-base font-bold">
            How selling works
          </h2>
          {terms.state.status === 'loading' ? (
            <Skeleton className="h-28 rounded-input" />
          ) : terms.state.status === 'error' ? (
            <ErrorState message={terms.state.error.message} onRetry={terms.retry} />
          ) : (
            <ConsignmentTermsSummary terms={terms.state.data} />
          )}
        </section>
        {payout.state.status === 'loading' ? (
          <Skeleton className="h-36 rounded-card" />
        ) : payout.state.status === 'error' ? (
          <ErrorState message={payout.state.error.message} onRetry={payout.retry} />
        ) : (
          <PayoutMethodCard
            method={payout.state.data}
            pending={setup.pending}
            error={setup.error?.message ?? null}
            onSetup={async () => {
              const r = await setup.run();
              if (r?.ok) {
                payout.setData(r.data);
                toast.success('Payout method saved');
              }
            }}
          />
        )}
      </div>

      {state.status === 'loading' ? (
        <ListSkeleton rows={4} />
      ) : state.status === 'error' ? (
        <ErrorState message={state.error.message} onRetry={retry} />
      ) : state.data.length === 0 ? (
        <EmptyState
          icon={HandCoins}
          text="You haven’t asked Dibs to sell anything yet. Mark items as Sell when you book Summer Hold."
          actionLabel="Book Summer Hold"
          href="/summer-hold/book"
        />
      ) : (
        <>
          <section aria-labelledby="active-h" className="flex flex-col gap-3">
            <h2 id="active-h" className="text-xl font-bold">
              In progress
            </h2>
            {list(state.data.filter((c) => ACTIVE_CONSIGNMENT.includes(c.status)))}
          </section>
          <section aria-labelledby="done-h" className="flex flex-col gap-3">
            <h2 id="done-h" className="text-xl font-bold">
              Finished
            </h2>
            {list(state.data.filter((c) => !ACTIVE_CONSIGNMENT.includes(c.status)))}
          </section>
        </>
      )}

      <Button asChild variant="link" className="w-fit px-0">
        <Link href="/summer-hold/booking">Back to my Summer Hold</Link>
      </Button>
    </div>
  );
}
