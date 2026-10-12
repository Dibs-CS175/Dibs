'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Archive, BadgeCheck, MapPin, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ListingPhoto } from '@/components/listing/listing-photo';
import { formatMoney, timeLeft } from '@/lib/format';
import type { ISODate, RegistrationTier, SummerHoldTeaser as SummerHoldTeaserData } from '@/lib/types';

export function Hero({ campusName }: { campusName: string | null }) {
  return (
    <section className="container grid max-w-content items-center gap-10 py-12 md:grid-cols-2 md:py-20">
      <div className="flex flex-col gap-6">
        {campusName ? (
          <p className="w-fit rounded-full bg-zest px-3 py-1 text-xs font-semibold text-on-accent">
            {campusName} student marketplace
          </p>
        ) : null}
        <h1 className="text-6xl font-extrabold tracking-tight md:text-8xl">Called it.</h1>
        <p className="max-w-[44ch] text-xl text-muted">
          Buy and sell with verified students. Hand off safely with Dibs Protect. Store your stuff over summer
          with Summer Hold.
        </p>
        <div className="flex flex-col gap-3 md:flex-row">
          <Button asChild size="lg">
            <Link href="/verify">
              <BadgeCheck className="h-5 w-5" aria-hidden /> Verify with your campus email
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/browse">Browse listings</Link>
          </Button>
        </div>
      </div>
      <div className="relative mx-auto grid w-full max-w-md grid-cols-3 gap-3" aria-hidden="true">
        {['ph:Armchair:0', 'ph:LampDesk:0', 'ph:Bike:0'].map((p, i) => (
          <div key={p} className={i === 1 ? '-translate-y-4' : 'translate-y-4'}>
            <ListingPhoto src={p} alt="" className="aspect-[4/5] w-full rounded-card shadow-2" />
          </div>
        ))}
      </div>
    </section>
  );
}

const TRUST = [
  { icon: BadgeCheck, title: 'Verified students', text: 'Every account is tied to a campus email.' },
  {
    icon: ShieldCheck,
    title: 'Dibs Protect',
    text: 'Your payment is held until you share the handoff code.',
  },
  { icon: MapPin, title: 'Public meetup spots', text: 'Suggested spots that are busy and well lit.' },
];

export function TrustBand() {
  return (
    <section className="bg-grove text-white" aria-labelledby="trust-h">
      <div className="container max-w-content py-12">
        <h2 id="trust-h" className="sr-only">
          Why trade on Dibs
        </h2>
        <ul className="grid gap-8 md:grid-cols-3">
          {TRUST.map((t) => (
            <li key={t.title} className="flex flex-col gap-2">
              <span className="grid h-12 w-12 place-items-center rounded-card bg-white/10">
                <t.icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="text-lg font-bold">{t.title}</h3>
              <p className="text-sm text-white/85">{t.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const STEPS = [
  { title: 'Verify', text: 'Sign in with your campus email.' },
  {
    title: 'List it or call dibs',
    text: 'Post in a minute, or hold the Dibs button to claim something first.',
  },
  { title: 'Meet and hand off', text: 'Check the item, share your code, and the seller gets paid.' },
];

export function HowItWorks() {
  return (
    <section className="container max-w-content py-16" aria-labelledby="how-h">
      <h2 id="how-h" className="mb-8 text-3xl font-extrabold">
        How it works
      </h2>
      <ol className="grid gap-4 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-4 rounded-card border border-line bg-surface p-6">
            <span className="tabular font-display text-5xl font-extrabold leading-none text-rind" aria-hidden>
              {i + 1}
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold">{s.title}</h3>
              <p className="text-muted">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Countdown to a timestamp returned by a query. Formatting time left is display only. */
export function Countdown({ to, label }: { to: ISODate; label: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  const left = timeLeft(to, now ?? new Date(to));
  const parts: [string, number][] = [
    ['days', left.days],
    ['hours', left.hours],
    ['minutes', left.minutes],
  ];
  return (
    <div
      role="timer"
      aria-label={`${left.days} days, ${left.hours} hours, ${left.minutes} minutes ${label}`}
      className="grid max-w-sm grid-cols-3 gap-2"
    >
      {parts.map(([k, v]) => (
        <div key={k} className="flex flex-col items-center rounded-card bg-grove px-2 py-3 text-white">
          <span className="tabular font-display text-4xl font-extrabold leading-none">
            {now === null ? '--' : String(v).padStart(2, '0')}
          </span>
          <span className="mt-1 text-xs uppercase tracking-wide text-white/80">{k}</span>
        </div>
      ))}
    </div>
  );
}

/** Summer Hold teaser. Every number comes from getSummerHoldTeaser and getSummerHoldOffers. */
export function SummerHoldTeaser({ teaser, tier }: { teaser: SummerHoldTeaserData; tier: RegistrationTier }) {
  return (
    <div className="grid items-center gap-8 rounded-sheet border border-line bg-surface p-6 md:grid-cols-2 md:p-10">
      <div className="flex flex-col gap-4">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-rind">
          <Archive className="h-4 w-4" aria-hidden /> Summer Hold
        </p>
        <h2 id="hold-h" className="text-3xl font-extrabold md:text-5xl">
          Don&apos;t haul it home. Hold it.
        </h2>
        <p className="text-muted">
          We pick up your things at move-out, store them over summer, and bring them back in the fall.
        </p>
        <p className="tabular text-2xl font-bold">
          {teaser.itemCount} items from {formatMoney(teaser.totalCents)}
          <span className="block text-sm font-normal text-muted">
            All-in price, every required fee included.
          </span>
        </p>
        <Button asChild className="w-fit">
          <Link href="/summer-hold">See how Summer Hold works</Link>
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-muted">
          {tier.label} at {formatMoney(tier.cents)}
          {tier.endsAt ? ' ends in' : ''}
        </p>
        {tier.endsAt ? (
          <Countdown to={tier.endsAt} label={`until ${tier.label} ends`} />
        ) : (
          <p className="rounded-card bg-sunk p-4 text-sm">Registration dates are coming soon.</p>
        )}
      </div>
    </div>
  );
}
