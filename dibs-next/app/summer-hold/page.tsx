'use client';

import Link from 'next/link';
import { Archive, Box, CalendarClock, CalendarX, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState, ErrorState, LoadingBlock } from '@/components/states';
import { boxRuleText } from '@/components/summer-hold/offer-bits';
import { SlotAvailability } from '@/components/summer-hold/slot-picker';
import { Button } from '@/components/ui/button';
import { useCampusState } from '@/lib/campus';
import { errorMessage } from '@/lib/errorMessages';
import { formatMoney } from '@/lib/format';
import { useQuery } from '@/lib/hooks';
import { getSummerHoldOffers, getSummerHoldTeaser } from '@/lib/queries/pricing';
import { getPickupSlots } from '@/lib/queries/summerHold';
import { ok } from '@/lib/result';
import { useSession } from '@/lib/session';
import type { SlotView, SummerHoldOffers, SummerHoldTeaser } from '@/lib/types';

const STEPS = [
  {
    icon: Box,
    title: 'Sign up and count your items',
    body: 'Tell us where you live and how many items. You see the all-in total before you pay.',
  },
  {
    icon: Truck,
    title: 'We pick up at move-out',
    body: 'Pack yourself, or add Full Service and we pack for you.',
  },
  { icon: ShieldCheck, title: 'Stored over summer', body: 'Every item is covered while we have it.' },
  {
    icon: PackageCheck,
    title: 'Back in the fall',
    body: 'Pick up your items, or add delivery to your new place.',
  },
];

export default function SummerHoldPage() {
  const { campus, error: campusError, retry: retryCampus } = useCampusState();
  const { state: session } = useSession();
  const signedIn = session.status === 'data' && session.data !== null;
  const campusId = campus?.id ?? null;
  const offers = useQuery(
    () => (campusId ? getSummerHoldOffers(campusId) : Promise.resolve(ok<SummerHoldOffers | null>(null))),
    [campusId],
  );
  const teaser = useQuery(
    () => (campusId ? getSummerHoldTeaser(campusId) : Promise.resolve(ok<SummerHoldTeaser | null>(null))),
    [campusId],
  );
  const slots = useQuery(
    () => (campusId ? getPickupSlots(campusId) : Promise.resolve(ok<SlotView[]>([]))),
    [campusId],
  );

  return (
    <div className="container flex max-w-content flex-col gap-12 py-8 md:py-14">
      <PageHeader
        title="Summer Hold"
        subtitle="Leaving for summer? We pick up what you want to keep, store it, and have it ready in the fall."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="dibs" size="lg">
              <Link href="/summer-hold/book">Sign up</Link>
            </Button>
            {signedIn ? (
              <Button asChild variant="secondary" size="lg">
                <Link href="/summer-hold/booking">My booking</Link>
              </Button>
            ) : null}
          </div>
        }
      />

      {campusError ? <ErrorState message={errorMessage(campusError)} onRetry={retryCampus} /> : null}

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

      <section aria-labelledby="inc-h" className="flex flex-col gap-3">
        <h2 id="inc-h" className="text-2xl font-bold">
          What’s included
        </h2>
        {campusError ? null : offers.state.status === 'loading' ||
          teaser.state.status === 'loading' ||
          !campusId ? (
          <LoadingBlock className="h-36 rounded-card" />
        ) : offers.state.status === 'error' ? (
          <ErrorState message={errorMessage(offers.state.error)} onRetry={offers.retry} />
        ) : teaser.state.status === 'error' ? (
          <ErrorState message={errorMessage(teaser.state.error)} onRetry={teaser.retry} />
        ) : !offers.state.data || !teaser.state.data ? (
          <EmptyState
            icon={Archive}
            text="Summer Hold isn’t open at this campus yet."
            actionLabel="Browse listings"
            href="/browse"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-1 rounded-card bg-sunk p-5">
              <p className="tabular font-display text-3xl font-extrabold">
                {teaser.state.data.itemCount} items from {formatMoney(teaser.state.data.totalCents)}
              </p>
              <p className="text-sm text-muted">All-in price. Every required fee is included.</p>
            </div>
            <div className="flex flex-col gap-1 rounded-card bg-sunk p-5">
              <p className="tabular font-display text-3xl font-extrabold">
                {formatMoney(offers.state.data.coveragePerItemCents)}
              </p>
              <p className="text-sm text-muted">coverage per item included</p>
            </div>
            <div className="flex flex-col gap-1 rounded-card bg-sunk p-5">
              <p className="font-semibold">Standard item</p>
              <p className="text-sm text-muted">{boxRuleText(offers.state.data.standardBoxRule)}.</p>
              <p className="mt-1 font-semibold">Large item</p>
              <p className="text-sm text-muted">Anything bigger: furniture, bikes, mini-fridges.</p>
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="slots-h" className="flex flex-col gap-4">
        <h2 id="slots-h" className="flex items-center gap-2 text-2xl font-bold">
          <CalendarClock className="h-5 w-5" aria-hidden /> Move-out pickup windows
        </h2>
        {campusError ? null : slots.state.status === 'loading' || !campusId ? (
          <LoadingBlock className="h-40 rounded-card" />
        ) : slots.state.status === 'error' ? (
          <ErrorState message={errorMessage(slots.state.error)} onRetry={slots.retry} />
        ) : slots.state.data.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            text="Pickup windows open in spring. Check back soon."
            actionLabel="Sign up now"
            href="/summer-hold/book"
          />
        ) : (
          <SlotAvailability slots={slots.state.data} />
        )}
      </section>
    </div>
  );
}
