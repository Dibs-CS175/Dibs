'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Code2, MonitorPlay, RotateCcw } from 'lucide-react';
import { DevControls } from '@/components/dev/dev-controls';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  devToolbarEnabled,
  resetDevState,
  setDevState,
  useDevState,
  type DataSource,
  type DevRole,
} from '@/lib/dev/state';
import { cn } from '@/lib/utils';

type Screen = { label: string; href: string; role?: Exclude<DevRole, 'signed_out'> };

// Ids point at fixture records, so every link opens a filled screen in Demo.
const SCREENS: { group: string; items: Screen[] }[] = [
  {
    group: 'Public',
    items: [
      { label: 'Home', href: '/' },
      { label: 'Summer Hold', href: '/summer-hold' },
      { label: 'Verify email', href: '/verify' },
      { label: 'Parent pay link', href: '/pay/demo-parent-7Hq2' },
    ],
  },
  {
    group: 'Student',
    items: [
      { label: 'Browse', href: '/browse', role: 'student' },
      { label: 'Listing', href: '/listings/l02', role: 'student' },
      { label: 'Sell an item', href: '/sell', role: 'student' },
      { label: 'Orders', href: '/orders', role: 'student' },
      { label: 'Order (handoff code)', href: '/orders/o2', role: 'student' },
      { label: 'Messages', href: '/messages', role: 'student' },
      { label: 'Conversation', href: '/messages/c1', role: 'student' },
      { label: 'Profile', href: '/profile', role: 'student' },
      { label: 'Book Summer Hold', href: '/summer-hold/book', role: 'student' },
      { label: 'My booking', href: '/summer-hold/booking', role: 'student' },
    ],
  },
  {
    group: 'Admin',
    items: [
      { label: 'Goods inventory', href: '/admin/goods', role: 'admin' },
      { label: 'Goods intake', href: '/admin/goods/new', role: 'admin' },
    ],
  },
];

const SOURCE_CARDS: { id: DataSource; title: string; icon: typeof Code2; body: string }[] = [
  {
    id: 'demo',
    title: 'Demo',
    icon: MonitorPlay,
    body: 'The working mockup. Every screen is filled with made-up data and every button responds. Use the controls to preview each role and the loading, empty and error states.',
  },
  {
    id: 'live',
    title: 'Live',
    icon: Code2,
    body: 'Our code in lib/live. Each function starts as a stub that answers “Not built yet”, so most screens show an error at first. As we replace stubs with real code, the screens that use them start working.',
  },
];

/** Dev-only preview panel. Available when NEXT_PUBLIC_DEV_TOOLBAR=true; not linked from the site. */
export default function PreviewPanelPage() {
  const dev = useDevState();
  if (!devToolbarEnabled) notFound();
  const live = dev.source === 'live';

  const open = (s: Screen) => {
    // In Demo, opening a screen signs in as the role it needs. Admins can open student screens too.
    if (live || !s.role) return;
    if (s.role === 'student' ? dev.role === 'signed_out' : dev.role !== 'admin') setDevState({ role: s.role });
  };

  return (
    <div className="container flex max-w-content flex-col gap-6 py-8 md:py-12">
      <PageHeader
        title="Preview panel"
        subtitle="Switch between the working mockup and our own code, then open any screen."
      />

      <section aria-label="Data source" className="grid gap-4 md:grid-cols-2">
        {SOURCE_CARDS.map((c) => {
          const active = dev.source === c.id;
          return (
            <Card key={c.id} className={cn(active && 'border-2 border-ink')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <c.icon className="h-5 w-5" aria-hidden /> {c.title}
                  {active ? <span className="text-sm font-semibold text-muted">(in use)</span> : null}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-muted">{c.body}</p>
                <Button
                  variant={active ? 'secondary' : 'default'}
                  className="w-fit"
                  disabled={active}
                  onClick={() => setDevState({ source: c.id })}
                >
                  {active ? `Using ${c.title}` : `Use ${c.title}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <DevControls />
            <Button variant="secondary" className="w-fit" onClick={resetDevState}>
              <RotateCcw className="h-4 w-4" aria-hidden /> Reset controls
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Screens</CardTitle>
            <p className="text-sm text-muted">
              {live
                ? 'Live: screens behind sign-in need getSession in lib/live/queries/users.ts first.'
                : 'Demo: opening a student or admin screen signs you in as that role.'}
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {SCREENS.map((g) => (
              <div key={g.group} className="flex flex-col gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wide text-muted">{g.group}</h2>
                <ul className="flex flex-wrap gap-2">
                  {g.items.map((s) => (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        onClick={() => open(s)}
                        className="inline-flex min-h-[40px] items-center rounded-full border border-line px-3 text-sm font-semibold hover:bg-sunk"
                      >
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Turning a stub into real code</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm">
            <li>
              Open the file named in the error, for example <code>lib/live/queries/listings.ts</code>.
            </li>
            <li>Replace the function body with real code. Keep its name, parameters and return type.</li>
            <li>
              Delete its <code>{'// STUB(…)'}</code> line. <code>npm run stubs</code> counts what is left.
            </li>
            <li>Pick Live above and open a screen that uses it. The Demo version stays as it was.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
