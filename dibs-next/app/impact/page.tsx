'use client';

import { Leaf } from 'lucide-react';
import { CategoryBars, ImpactTotals } from '@/components/impact/impact-views';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState, ErrorState } from '@/components/states';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@/lib/hooks';
import { getImpactStats } from '@/lib/queries/impact';

export default function ImpactPage() {
  const { state, retry } = useQuery(() => getImpactStats(), []);
  return (
    <div className="container flex max-w-content flex-col gap-8 py-8 md:py-14">
      <PageHeader
        title="Impact"
        subtitle="Every item resold or stored is one that did not go to the curb. Pound figures are estimated from typical item weights."
      />
      {state.status === 'loading' ? (
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading">
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-36 rounded-card" />
            <Skeleton className="h-36 rounded-card" />
          </div>
          <Skeleton className="h-72 rounded-card" />
        </div>
      ) : state.status === 'error' ? (
        <ErrorState message={state.error.message} onRetry={retry} />
      ) : state.data.itemsKeptInUse === 0 ? (
        <EmptyState
          icon={Leaf}
          text="No impact numbers yet. They appear after the first trades."
          actionLabel="Browse listings"
          href="/browse"
        />
      ) : (
        <>
          <ImpactTotals stats={state.data} />
          <CategoryBars stats={state.data} />
        </>
      )}
    </div>
  );
}
