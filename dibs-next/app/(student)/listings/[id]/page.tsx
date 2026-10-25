'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronLeft, MessageCircle, PackageX, Tag } from 'lucide-react';
import { ConditionBadge, HousingFitBadge, SourceBadge } from '@/components/listing/badges';
import { Gallery } from '@/components/listing/gallery';
import { HoldToDibs } from '@/components/listing/hold-to-dibs';
import { ListingCard } from '@/components/listing/listing-card';
import { SellerCard } from '@/components/listing/seller-card';
import { CheckoutSheet, OfferSheet } from '@/components/listing/sheets';
import { EmptyState, ErrorState, PageSkeleton } from '@/components/states';
import { Button } from '@/components/ui/button';
import { removeListing } from '@/lib/actions/listings';
import { startConversation } from '@/lib/actions/messages';
import { holdToDibs, makeOffer } from '@/lib/actions/orders';
import { formatMoney, timeAgo } from '@/lib/format';
import { useAction, useQuery } from '@/lib/hooks';
import { getListing, getSimilarListings } from '@/lib/queries/listings';
import { getCheckoutQuote } from '@/lib/queries/pricing';
import { getSettings } from '@/lib/queries/users';
import { errorMessage } from '@/lib/errorMessages';
import { useTimeZone } from '@/lib/campus';
import { useSession } from '@/lib/session';

const HOLD_ERRORS = {
  CONFLICT: 'Someone called dibs first.',
  PAYMENT_FAILED: 'Your card was declined. Try another card.',
  NOT_FOUND: 'This listing is no longer available.',
};

export default function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const tz = useTimeZone();
  const { state: session } = useSession();
  const signedIn = session.status === 'data' && session.data !== null;
  const { state, retry } = useQuery(() => getListing(id), [id]);
  const settings = useQuery(() => getSettings(), []);
  const similar = useQuery(() => getSimilarListings(id), [id]);
  const [checkout, setCheckout] = useState(false);
  const quote = useQuery(
    () =>
      checkout
        ? getCheckoutQuote(id)
        : Promise.resolve({ ok: true as const, data: { lines: [], totalCents: 0 } }),
    [checkout, id],
  );
  const [offerOpen, setOfferOpen] = useState(false);
  const hold = useAction(holdToDibs);
  const offer = useAction(makeOffer);
  const chat = useAction(startConversation);
  const remove = useAction(removeListing);

  const requireSignIn = () => {
    router.push(`/verify?next=${encodeURIComponent(`/listings/${id}`)}`);
  };

  if (state.status === 'loading') return <PageSkeleton />;
  if (state.status === 'error') {
    return (
      <div className="container max-w-content py-16">
        {state.error.code === 'NOT_FOUND' ? (
          <EmptyState
            icon={PackageX}
            text="This listing was removed or sold."
            actionLabel="Browse listings"
            href="/browse"
          />
        ) : (
          <ErrorState message={errorMessage(state.error)} onRetry={retry} />
        )}
      </div>
    );
  }

  const { listing: l, seller, isOwn } = state.data;
  const gesture = settings.state.status === 'data' ? settings.state.data.dibsGesture : 'hold';
  const unavailable = l.status !== 'active';

  return (
    <div className="container flex max-w-content flex-col gap-12 py-6 md:py-10">
      <div className="grid gap-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div>
          <Button variant="link" className="mb-2 px-0" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" aria-hidden /> Back
          </Button>
          <Gallery photos={l.photos} title={l.title} />
        </div>
        <div className="flex flex-col gap-5 md:pt-12">
          <p className="text-xs text-muted">Listed {timeAgo(l.createdAt, tz)}</p>
          <h1 className="text-4xl font-extrabold md:text-5xl">{l.title}</h1>
          <p className="tabular font-display text-5xl font-extrabold leading-none">
            {l.priceCents === 0 ? 'Free' : formatMoney(l.priceCents)}
          </p>
          <div className="flex flex-wrap gap-2">
            <ConditionBadge condition={l.condition} />
            <SourceBadge source={l.source} />
          </div>
          <HousingFitBadge fit={l.housingFit} showExplain />

          {isOwn ? (
            <div className="flex flex-col gap-3 rounded-card bg-sunk p-4">
              <p className="font-semibold">This is your listing.</p>
              {remove.error ? (
                <p role="alert" className="text-sm text-error">
                  {errorMessage(remove.error)}
                </p>
              ) : null}
              <Button
                variant="destructive"
                disabled={remove.pending}
                onClick={async () => {
                  const r = await remove.run(l.id);
                  if (r?.ok) {
                    toast.success('Listing removed');
                    router.push('/profile');
                  }
                }}
              >
                {remove.pending ? 'Removing…' : 'Remove listing'}
              </Button>
            </div>
          ) : unavailable ? (
            <p className="rounded-card bg-sunk p-4 font-semibold">Someone already called dibs on this.</p>
          ) : (
            <div className="flex flex-col gap-3">
              <HoldToDibs
                mode={gesture}
                onComplete={() => (signedIn ? setCheckout(true) : requireSignIn())}
              />
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" onClick={() => (signedIn ? setOfferOpen(true) : requireSignIn())}>
                  <Tag className="h-4 w-4" aria-hidden /> Make an offer
                </Button>
                <Button
                  variant="secondary"
                  disabled={chat.pending}
                  onClick={async () => {
                    if (!signedIn) return requireSignIn();
                    const r = await chat.run(l.id);
                    if (r?.ok) router.push(`/messages/${r.data.id}`);
                    else if (r) toast.error(errorMessage(r.error));
                  }}
                >
                  <MessageCircle className="h-4 w-4" aria-hidden /> Message seller
                </Button>
              </div>
            </div>
          )}

          <section aria-labelledby="desc-h" className="flex flex-col gap-2">
            <h2 id="desc-h" className="text-xl font-bold">
              Description
            </h2>
            <p>{l.description}</p>
          </section>
          <SellerCard seller={seller} source={l.source} />
        </div>
      </div>

      <section aria-labelledby="sim-h" className="flex flex-col gap-3">
        <h2 id="sim-h" className="text-2xl font-bold">
          Similar items
        </h2>
        {similar.state.status === 'loading' ? (
          <div className="flex gap-4" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton aspect-[4/5] w-40 rounded-card" />
            ))}
          </div>
        ) : similar.state.status === 'error' ? (
          <ErrorState message={errorMessage(similar.state.error)} onRetry={similar.retry} />
        ) : similar.state.data.length === 0 ? (
          <EmptyState
            icon={PackageX}
            text="No similar items right now."
            actionLabel="Browse listings"
            href="/browse"
          />
        ) : (
          <ul className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
            {similar.state.data.map((v) => (
              <li key={v.listing.id} className="w-[44%] shrink-0 md:w-[23%]">
                <ListingCard view={v} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-sm text-muted">
        Want to sell something similar?{' '}
        <Link className="font-semibold text-rind" href="/sell">
          List it in a minute
        </Link>
        .
      </p>

      <CheckoutSheet
        open={checkout}
        onOpenChange={(o) => {
          setCheckout(o);
          if (!o) hold.clearError();
        }}
        title={l.title}
        quote={quote.state}
        onRetryQuote={quote.retry}
        pending={hold.pending}
        error={hold.error ? errorMessage(hold.error, HOLD_ERRORS) : null}
        onConfirm={async () => {
          const r = await hold.run(l.id);
          if (!r) return;
          if (!r.ok && r.error.code === 'NOT_SIGNED_IN') return requireSignIn();
          if (r.ok) {
            setCheckout(false);
            toast.success('Dibs! Your payment is held by Dibs Protect.');
            router.push(`/orders/${r.data.id}`);
          }
        }}
      />
      <OfferSheet
        open={offerOpen}
        onOpenChange={setOfferOpen}
        pending={offer.pending}
        error={
          offer.error
            ? errorMessage(offer.error, {
                VALIDATION: 'That offer is not allowed for this listing.',
                CONFLICT: 'This listing just sold.',
              })
            : null
        }
        onSubmit={async (cents) => {
          const r = await offer.run(l.id, cents);
          if (r?.ok) {
            setOfferOpen(false);
            toast.success(`Offer of ${formatMoney(r.data.offerCents)} sent`);
          }
        }}
      />
    </div>
  );
}
