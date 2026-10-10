'use client';

import Link from 'next/link';
import { Box, CalendarClock, CalendarX, HandCoins, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { SlotAvailability } from '@/components/summer-hold/slot-picker';
import { EmptyState, ErrorState } from '@/components/states';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@/lib/hooks';
import { getPickupSlots } from '@/lib/queries/summerHold';
import { getConsignmentTerms } from '@/lib/queries/consignment';
import { ConsignmentTermsSummary } from '@/components/summer-hold/consignment-terms';
import { useSession } from '@/lib/session';

const STEPS = [
  {
    icon: Box,
    title: 'Book and list your items',
    body: 'Tell us where you live and what you are storing. You see the exact quote before paying a deposit.',
  },
  {
    icon: Truck,
    title: 'We pick up at move-out',
    body: 'Choose a two-hour window during move-out week. We photograph each item at check-in.',
  },
  {
    icon: ShieldCheck,
    title: 'Stored over summer',
    body: 'Items sit in a locked, climate-controlled unit. Track status any time.',
  },
  {
    icon: PackageCheck,
    title: 'Delivered back in fall',
    body: 'Pick a return window the week before classes.',
  },
];

export default function SummerHoldPage() {
  const { state: session } = useSession();
  const signedIn = session.status === 'data' && session.data !== null;
  const { state, retry } = useQuery(() => getPickupSlots(), []);
  const terms = useQuery(() => getConsignmentTerms(), []);

  return (
    <div className="container flex max-w-content flex-col gap-12 py-8 md:py-14">
      <PageHeader
        title="Summer Hold"
        subtitle="Leaving for summer? We pick up what you want to keep, store it, and bring it back in fall."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="dibs" size="lg">
              <Link href="/summer-hold/book">Book a pickup</Link>
            </Button>
            {signedIn ? (
              <Button asChild variant="secondary" size="lg">
                <Link href="/summer-hold/booking">My booking</Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex flex-col gap-2 rounded-card border border-line bg-surface p-5">
            <span className="flex items-center gap-2 text-xs font-semibold text-muted">
              <s.icon className="h-5 w-5 text-success" aria-hidden /> Step {i + 1}
            </span>
            <h2 className="text-lg font-bold">{s.title}</h2>
            <p className="text-sm text-muted">{s.body}</p>
          </li>
        ))}
      </ol>

      <section aria-labelledby="price-h" className="flex flex-col gap-2 rounded-card bg-sunk p-5">
        <h2 id="price-h" className="text-xl font-bold">
          What it costs
        </h2>
        <p>
          Pricing is per item, with standard and large sizes. Your quote shows every line before you pay, and
          the deposit is held by Dibs Protect.
        </p>
      </section>

      <section
        aria-labelledby="sell-h"
        className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5"
      >
        <h2 id="sell-h" className="flex items-center gap-2 text-xl font-bold">
          <HandCoins className="h-5 w-5 text-success" aria-hidden /> Don’t want it back? We’ll sell it.
        </h2>
        <p>
          Mark any item as Sell when you book. We list it, sell it, hand it to the buyer and pay you your
          share.
        </p>
        {terms.state.status === 'loading' ? (
          <Skeleton className="h-28 rounded-input" />
        ) : terms.state.status === 'error' ? (
          <ErrorState message={terms.state.error.message} onRetry={terms.retry} />
        ) : (
          <ConsignmentTermsSummary terms={terms.state.data} />
        )}
      </section>

      <section aria-labelledby="slots-h" className="flex flex-col gap-4">
        <h2 id="slots-h" className="flex items-center gap-2 text-2xl font-bold">
          <CalendarClock className="h-5 w-5" aria-hidden /> Pickup windows
        </h2>
        {state.status === 'loading' ? (
          <div className="grid grid-cols-2 gap-2" aria-busy="true" aria-label="Loading">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-input" />
            ))}
          </div>
        ) : state.status === 'error' ? (
          <ErrorState message={state.error.message} onRetry={retry} />
        ) : state.data.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            text="Pickup windows open in spring. Check back soon."
            actionLabel="Browse listings"
            href="/browse"
          />
        ) : (
          <SlotAvailability slots={state.data} />
        )}
      </section>
    </div>
  );
}
