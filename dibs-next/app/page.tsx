'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf } from 'lucide-react';
import { HowItWorks, Hero, SummerHoldTeaser, TrustBand } from '@/components/landing/landing';
import { ImpactTotals } from '@/components/impact/impact-views';
import { EmptyState, ErrorState } from '@/components/states';
import { Skeleton } from '@/components/ui/skeleton';
import { MOVE_OUT_DATE } from '@/lib/config/app';
import { useQuery } from '@/lib/hooks';
import { getImpactStats } from '@/lib/queries/impact';
import { useSession } from '@/lib/session';

export default function LandingPage() {
  const { state: session } = useSession();
  const router = useRouter();
  const signedIn = session.status === 'data' && session.data !== null;
  useEffect(() => {
    if (signedIn) router.replace('/browse');
  }, [signedIn, router]);

  const { state, retry } = useQuery(() => getImpactStats(), []);

  return (
    <>
      <Hero />
      <TrustBand />
      <HowItWorks />
      <SummerHoldTeaser moveOut={MOVE_OUT_DATE} />
      <section className="container max-w-content pb-8" aria-labelledby="impact-h">
        <h2 id="impact-h" className="mb-4 text-3xl font-extrabold">
          Kept in use so far
        </h2>
        {state.status === 'loading' ? (
          <div className="grid gap-4 md:grid-cols-2" aria-busy="true">
            <Skeleton className="h-40 rounded-card" />
            <Skeleton className="h-40 rounded-card" />
          </div>
        ) : state.status === 'error' ? (
          <ErrorState message={state.error.message} onRetry={retry} />
        ) : state.data.itemsKeptInUse === 0 ? (
          <EmptyState
            icon={Leaf}
            text="No trades counted yet. The first ones show up here."
            actionLabel="Browse listings"
            href="/browse"
          />
        ) : (
          <ImpactTotals stats={state.data} />
        )}
      </section>
    </>
  );
}
