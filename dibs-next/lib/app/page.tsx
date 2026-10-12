'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Archive } from 'lucide-react';
import { HowItWorks, Hero, SummerHoldTeaser, TrustBand } from '@/components/landing/landing';
import { EmptyState, ErrorState, LoadingBlock } from '@/components/states';
import { useCampusState } from '@/lib/campus';
import { errorMessage } from '@/lib/errorMessages';
import { useQuery } from '@/lib/hooks';
import { offerKey, useOffersShown } from '@/lib/offers';
import { getSummerHoldOffers, getSummerHoldTeaser } from '@/lib/queries/pricing';
import { ok } from '@/lib/result';
import { useSession } from '@/lib/session';
import type { SummerHoldOffers, SummerHoldTeaser as Teaser } from '@/lib/types';

export default function LandingPage() {
  const { state: session } = useSession();
  const router = useRouter();
  const { campus, error: campusError, retry: retryCampus } = useCampusState();
  const signedIn = session.status === 'data' && session.data !== null;
  useEffect(() => {
    if (signedIn) router.replace('/browse');
  }, [signedIn, router]);

  const campusId = campus?.id ?? null;
  const teaser = useQuery(
    () => (campusId ? getSummerHoldTeaser(campusId) : Promise.resolve(ok<Teaser | null>(null))),
    [campusId],
  );
  const offers = useQuery(
    () => (campusId ? getSummerHoldOffers(campusId) : Promise.resolve(ok<SummerHoldOffers | null>(null))),
    [campusId],
  );
  const tier = offers.state.status === 'data' ? offers.state.data?.currentTier : undefined;
  useOffersShown(
    tier && teaser.state.status === 'data' && teaser.state.data ? [offerKey.tier(tier.key)] : [],
  );

  const loading =
    (!campusId && !campusError) || teaser.state.status === 'loading' || offers.state.status === 'loading';
  const failed = campusError
    ? campusError
    : teaser.state.status === 'error'
      ? teaser.state.error
      : offers.state.status === 'error'
        ? offers.state.error
        : null;

  return (
    <>
      <Hero campusName={campus?.name ?? null} />
      <TrustBand />
      <HowItWorks />
      <section className="container max-w-content py-16" aria-label="Summer Hold">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2" aria-busy="true" aria-label="Loading">
            <LoadingBlock className="h-64 rounded-sheet" />
            <LoadingBlock className="h-64 rounded-sheet" />
          </div>
        ) : failed ? (
          <ErrorState
            message={errorMessage(failed)}
            onRetry={() => {
              retryCampus();
              teaser.retry();
              offers.retry();
            }}
          />
        ) : teaser.state.status === 'data' && teaser.state.data && tier ? (
          <SummerHoldTeaser teaser={teaser.state.data} tier={tier} />
        ) : (
          <EmptyState
            icon={Archive}
            text="Summer Hold isn’t open at this campus yet."
            actionLabel="See how Summer Hold works"
            href="/summer-hold"
          />
        )}
      </section>
    </>
  );
}
