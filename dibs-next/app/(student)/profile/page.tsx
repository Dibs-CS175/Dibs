'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Archive, Heart, LogOut, Package, ShieldAlert, Tag, type LucideIcon } from 'lucide-react';
import { VerifiedBadge } from '@/components/listing/badges';
import { ListingCard } from '@/components/listing/listing-card';
import { QuoteLines } from '@/components/listing/quote-lines';
import { OrderRow } from '@/components/orders/order-row';
import { ReferralCode } from '@/components/profile/referral-code';
import { SettingsForm } from '@/components/profile/settings-form';
import { CardGridSkeleton, EmptyState, ErrorState, ListSkeleton, LoadingBlock } from '@/components/states';
import { BookingStatusBadge } from '@/components/summer-hold/booking-bits';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toggleSave } from '@/lib/actions/listings';
import { signOut, updateSettings } from '@/lib/actions/users';
import { useTimeZone } from '@/lib/campus';
import { errorMessage } from '@/lib/errorMessages';
import { formatDate, shortName } from '@/lib/format';
import { useAction, useQuery, type QueryState } from '@/lib/hooks';
import { getMyListings, getSavedListings } from '@/lib/queries/listings';
import { getMyOrders } from '@/lib/queries/orders';
import { getMyBooking } from '@/lib/queries/summerHold';
import { getSettings } from '@/lib/queries/users';
import { useSession } from '@/lib/session';
import type { ListingCardView } from '@/lib/types';

function CardGrid({
  q,
  retry,
  icon,
  empty,
  actionLabel,
  href,
  onToggleSave,
}: {
  q: QueryState<ListingCardView[]>;
  retry: () => void;
  icon: LucideIcon;
  empty: string;
  actionLabel: string;
  href: string;
  onToggleSave?: (id: string, next: boolean) => void;
}) {
  if (q.status === 'loading') return <CardGridSkeleton count={4} />;
  if (q.status === 'error') return <ErrorState message={errorMessage(q.error)} onRetry={retry} />;
  if (q.data.length === 0)
    return <EmptyState icon={icon} text={empty} actionLabel={actionLabel} href={href} />;
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {q.data.map((v) => (
        <li key={v.listing.id}>
          <ListingCard view={v} onToggleSave={onToggleSave} />
        </li>
      ))}
    </ul>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const tz = useTimeZone();
  const { state: session } = useSession();
  const mine = useQuery(() => getMyListings(), []);
  const saved = useQuery(() => getSavedListings(), []);
  const orders = useQuery(() => getMyOrders(), []);
  const booking = useQuery(() => getMyBooking(), []);
  const settings = useQuery(() => getSettings(), []);
  const save = useAction(updateSettings);
  const out = useAction(signOut);
  const unsave = useAction(toggleSave);
  const user = session.status === 'data' && session.data ? session.data.user : null;
  const campus = session.status === 'data' && session.data ? session.data.campus : null;

  return (
    <div className="container flex max-w-content flex-col gap-6 py-8 md:py-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        {user ? (
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold md:text-5xl">{shortName(user)}</h1>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              {user.verified ? (
                <VerifiedBadge verified label={`Verified student${campus ? ` · ${campus.name}` : ''}`} />
              ) : (
                <span className="flex items-center gap-1 text-rind">
                  <ShieldAlert className="h-4 w-4" aria-hidden /> Not verified yet ·{' '}
                  <Link href="/verify?next=/profile" className="font-semibold underline">
                    Verify your campus email
                  </Link>
                </span>
              )}
              <span className="tabular">{user.tradesCount} trades</span>
              <span>Since {formatDate(user.memberSince, tz, { month: 'short', year: 'numeric' })}</span>
            </p>
            <ReferralCode code={user.referralCode} />
          </div>
        ) : (
          <LoadingBlock className="h-24 w-72" />
        )}
        <Button
          variant="secondary"
          disabled={out.pending}
          onClick={async () => {
            const r = await out.run();
            if (r?.ok) {
              router.push('/');
              router.refresh();
            } else if (r) toast.error(errorMessage(r.error));
          }}
        >
          <LogOut className="h-4 w-4" aria-hidden /> {out.pending ? 'Signing out…' : 'Sign out'}
        </Button>
      </div>

      <Tabs defaultValue="listings">
        <TabsList aria-label="Profile sections">
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
          <TabsTrigger value="summer">Summer Hold</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          <CardGrid
            q={mine.state}
            retry={mine.retry}
            icon={Tag}
            empty="You haven’t listed anything yet."
            actionLabel="Sell an item"
            href="/sell"
          />
        </TabsContent>

        <TabsContent value="orders">
          {orders.state.status === 'loading' ? (
            <ListSkeleton />
          ) : orders.state.status === 'error' ? (
            <ErrorState message={errorMessage(orders.state.error)} onRetry={orders.retry} />
          ) : orders.state.data.length === 0 ? (
            <EmptyState icon={Package} text="No orders yet." actionLabel="Browse listings" href="/browse" />
          ) : (
            <ul className="flex flex-col gap-3">
              {orders.state.data.map((s) => (
                <li key={s.order.id}>
                  <OrderRow summary={s} />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="saved">
          <CardGrid
            q={saved.state}
            retry={saved.retry}
            icon={Heart}
            empty="Nothing saved. Tap the heart on a listing to keep it here."
            actionLabel="Browse listings"
            href="/browse"
            onToggleSave={async (id, next) => {
              const r = await unsave.run(id, next);
              if (r?.ok && saved.state.status === 'data')
                saved.setData(saved.state.data.filter((v) => v.listing.id !== id));
              else if (r && !r.ok) toast.error(errorMessage(r.error));
            }}
          />
        </TabsContent>

        <TabsContent value="summer">
          {booking.state.status === 'loading' ? (
            <LoadingBlock className="h-48 max-w-[560px] rounded-card" />
          ) : booking.state.status === 'error' ? (
            <ErrorState message={errorMessage(booking.state.error)} onRetry={booking.retry} />
          ) : booking.state.data === null ? (
            <EmptyState
              icon={Archive}
              text="No Summer Hold booking yet."
              actionLabel="Sign up"
              href="/summer-hold/book"
            />
          ) : (
            <div className="flex max-w-[560px] flex-col gap-4 rounded-card border border-line bg-surface p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="tabular font-semibold">
                  {booking.state.data.booking.standardCount} standard, {booking.state.data.booking.largeCount}{' '}
                  large
                </p>
                <BookingStatusBadge status={booking.state.data.booking.status} />
              </div>
              <QuoteLines quote={booking.state.data.booking.quote} />
              <Button asChild className="w-fit">
                <Link href="/summer-hold/booking">Manage booking</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          {settings.state.status === 'loading' ? (
            <LoadingBlock className="h-64 max-w-[560px] rounded-card" />
          ) : settings.state.status === 'error' ? (
            <ErrorState message={errorMessage(settings.state.error)} onRetry={settings.retry} />
          ) : (
            <SettingsForm
              initial={settings.state.data}
              pending={save.pending}
              error={save.error ? errorMessage(save.error) : null}
              onSave={async (s) => {
                const r = await save.run(s);
                if (r?.ok) {
                  settings.setData(r.data);
                  toast.success('Settings saved');
                }
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
