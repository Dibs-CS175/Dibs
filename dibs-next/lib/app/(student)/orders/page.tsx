'use client';

import { Package } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { OrderRow } from '@/components/orders/order-row';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/states';
import { useQuery } from '@/lib/hooks';
import { getMyOrders } from '@/lib/queries/orders';
import { errorMessage } from '@/lib/errorMessages';

export default function OrdersPage() {
  const { state, retry } = useQuery(() => getMyOrders(), []);
  return (
    <div className="container flex max-w-content flex-col gap-6 py-8 md:py-12">
      <PageHeader title="Orders" subtitle="Items you called dibs on and items you sold." />
      {state.status === 'loading' ? (
        <ListSkeleton rows={5} />
      ) : state.status === 'error' ? (
        <ErrorState message={errorMessage(state.error)} onRetry={retry} />
      ) : state.data.length === 0 ? (
        <EmptyState
          icon={Package}
          text="No orders yet. Call dibs on something you need."
          actionLabel="Browse listings"
          href="/browse"
        />
      ) : (
        <>
          <section aria-labelledby="active-h" className="flex flex-col gap-3">
            <h2 id="active-h" className="text-xl font-bold">
              In progress
            </h2>
            <ul className="flex flex-col gap-3">
              {state.data
                .filter((s) => s.order.status === 'held' || s.order.status === 'pending_payment')
                .map((s) => (
                  <li key={s.order.id}>
                    <OrderRow summary={s} />
                  </li>
                ))}
            </ul>
          </section>
          <section aria-labelledby="past-h" className="flex flex-col gap-3">
            <h2 id="past-h" className="text-xl font-bold">
              Past
            </h2>
            <ul className="flex flex-col gap-3">
              {state.data
                .filter((s) => s.order.status !== 'held' && s.order.status !== 'pending_payment')
                .map((s) => (
                  <li key={s.order.id}>
                    <OrderRow summary={s} />
                  </li>
                ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
