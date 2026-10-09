'use client';

import { Archive } from 'lucide-react';
import { BinCard } from '@/components/admin/bin-card';
import { PageHeader } from '@/components/layout/page-header';
import { CardGridSkeleton, EmptyState, ErrorState } from '@/components/states';
import { useQuery } from '@/lib/hooks';
import { getBins } from '@/lib/queries/logistics';

export default function BinsPage() {
  const { state, retry } = useQuery(() => getBins(), []);
  const units = state.status === 'data' ? Array.from(new Set(state.data.map((b) => b.unit))) : [];
  return (
    <>
      <PageHeader title="Bins" subtitle="Full bins are closed to new check-ins." />
      {state.status === 'loading' ? (
        <CardGridSkeleton count={6} />
      ) : state.status === 'error' ? (
        <ErrorState message={state.error.message} onRetry={retry} />
      ) : state.data.length === 0 ? (
        <EmptyState icon={Archive} text="No bins set up yet." actionLabel="Reload" onAction={retry} />
      ) : (
        units.map((u) => (
          <section key={u} aria-labelledby={`u-${u}`} className="flex flex-col gap-3">
            <h2 id={`u-${u}`} className="text-xl font-bold">
              {u}
            </h2>
            <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {state.data
                .filter((b) => b.unit === u)
                .map((b) => (
                  <li key={b.id}>
                    <BinCard bin={b} />
                  </li>
                ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}
