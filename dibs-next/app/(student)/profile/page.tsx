'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Archive, BadgeCheck, HandCoins, Heart, LogOut, Package, Tag } from 'lucide-react';
import { ListingCard } from '@/components/listing/listing-card';
import { OrderRow } from '@/components/orders/order-row';
import { SettingsForm } from '@/components/profile/settings-form';
import { CardGridSkeleton, EmptyState, ErrorState, ListSkeleton } from '@/components/states';
import { BookingTracker } from '@/components/summer-hold/booking-tracker';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toggleSave } from '@/lib/actions/listings';
import { signOut, updateSettings } from '@/lib/actions/users';
import { formatDate, formatMoney, formatWindow, shortName } from '@/lib/format';
import { useAction, useQuery } from '@/lib/hooks';
import { getMyListings, getSavedListings } from '@/lib/queries/listings';
import { getMyOrders } from '@/lib/queries/orders';
import { getMyBooking } from '@/lib/queries/summerHold';
import { getMyConsignments, getMyPayoutMethod } from '@/lib/queries/consignment';
import { startPayoutSetup } from '@/lib/actions/consignment';
import { ConsignmentStatusBadge } from '@/components/consignment/consignment-status';
import { PayoutMethodCard } from '@/components/consignment/payout-method-card';
import { getSettings } from '@/lib/queries/users';
import { useSession } from '@/lib/session';
import type { ListingCardView } from '@/lib/types';
import type { QueryState } from '@/lib/hooks';
import type { LucideIcon } from 'lucide-react';

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
  if (q.status === 'error') return <ErrorState message={q.error.message} onRetry={retry} />;
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
  const { state: session } = useSession();
  const mine = useQuery(() => getMyListings(), []);
  const saved = useQuery(() => getSavedListings(), []);
  const orders = useQuery(() => getMyOrders(), []);
  const booking = useQuery(() => getMyBooking(), []);
  const settings = useQuery(() => getSettings(), []);
  const consigned = useQuery(() => getMyConsignments(), []);
  const payout = useQuery(() => getMyPayoutMethod(), []);
  const setup = useAction(startPayoutSetup);
  const save = useAction(updateSettings);
  const out = useAction(signOut);
  const unsave = useAction(toggleSave);
  const user = session.status === 'data' && session.data ? session.data.user : null;

  return (
    <div className="container flex max-w-content flex-col gap-6 py-8 md:py-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        {user ? (
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-extrabold md:text-5xl">{shortName(user)}</h1>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <span className="flex items-center gap-1 text-success">
                <BadgeCheck className="h-4 w-4" aria-hidden /> Verified student
              </span>
              <span className="tabular">★ {user.rating.toFixed(1)}</span>
              <span className="tabular">{user.tradesCount} trades</span>
              <span>Since {formatDate(user.memberSince, { month: 'short', year: 'numeric' })}</span>
            </p>
          </div>
        ) : (
          <Skeleton className="h-16 w-64" />
        )}
        <Button
          variant="secondary"
          disabled={out.pending}
          onClick={async () => {
            const r = await out.run();
            if (r?.ok) router.push('/');
            else if (r) toast.error(r.error.message);
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
          <TabsTrigger value="consigned">Consigned</TabsTrigger>
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
            <ErrorState message={orders.state.error.message} onRetry={orders.retry} />
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
              else if (r && !r.ok) toast.error(r.error.message);
            }}
          />
        </TabsContent>

        <TabsContent value="summer">
          {booking.state.status === 'loading' ? (
            <Skeleton className="h-48 rounded-card" />
          ) : booking.state.status === 'error' ? (
            <ErrorState message={booking.state.error.message} onRetry={booking.retry} />
          ) : booking.state.data === null ? (
            <EmptyState
              icon={Archive}
              text="No Summer Hold booking yet."
              actionLabel="Book a pickup"
              href="/summer-hold/book"
            />
          ) : (
            <div className="flex max-w-[560px] flex-col gap-4 rounded-card border border-line bg-surface p-5">
              <BookingTracker status={booking.state.data.booking.status} />
              <p className="text-sm">
                {booking.state.data.booking.items.length} items
                {booking.state.data.pickupSlot
                  ? ` · Pickup ${formatWindow(booking.state.data.pickupSlot.startsAt, booking.state.data.pickupSlot.endsAt)}`
                  : null}
              </p>
              <Button asChild className="w-fit">
                <Link href="/summer-hold/booking">Manage booking</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="consigned">
          {consigned.state.status === 'loading' ? (
            <ListSkeleton />
          ) : consigned.state.status === 'error' ? (
            <ErrorState message={consigned.state.error.message} onRetry={consigned.retry} />
          ) : consigned.state.data.length === 0 ? (
            <EmptyState
              icon={HandCoins}
              text="Nothing consigned. Mark Summer Hold items as Sell and Dibs sells them for you."
              actionLabel="Book Summer Hold"
              href="/summer-hold/book"
            />
          ) : (
            <div className="flex flex-col gap-3">
              <ul className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface">
                {consigned.state.data.map((c) => (
                  <li key={c.item.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                    <span className="min-w-0 font-semibold">{c.item.label}</span>
                    <span className="flex items-center gap-2">
                      {c.payout ? (
                        <span className="tabular text-sm">{formatMoney(c.payout.totalCents)}</span>
                      ) : null}
                      <ConsignmentStatusBadge status={c.status} />
                    </span>
                  </li>
                ))}
              </ul>
              <Button asChild className="w-fit">
                <Link href="/summer-hold/consigned">Manage consigned items</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          {settings.state.status === 'loading' ? (
            <Skeleton className="h-64 max-w-[560px] rounded-card" />
          ) : settings.state.status === 'error' ? (
            <ErrorState message={settings.state.error.message} onRetry={settings.retry} />
          ) : (
            <SettingsForm
              initial={settings.state.data}
              pending={save.pending}
              error={save.error ? save.error.message : null}
              onSave={async (s) => {
                const r = await save.run(s);
                if (r?.ok) {
                  settings.setData(r.data);
                  toast.success('Settings saved');
                }
              }}
            />
          )}
          <div className="mt-8 max-w-[560px]">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
