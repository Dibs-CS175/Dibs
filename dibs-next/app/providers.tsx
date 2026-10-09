'use client';

import { Toaster } from 'sonner';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { DevToolbar } from '@/components/dev/dev-toolbar';
import { devToolbarEnabled } from '@/lib/dev/state';
import { useSession } from '@/lib/session';

/** App chrome. Reads the session once and hands it to the presentational header. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { state } = useSession();
  const user = state.status === 'data' && state.data ? state.data.user : null;
  return (
    <>
      <SiteHeader user={user} />
      <main id="main" tabIndex={-1} className="min-h-[70vh] focus:outline-none">
        {children}
      </main>
      <SiteFooter />
      <Toaster position="bottom-right" richColors closeButton toastOptions={{ className: 'font-sans' }} />
      {devToolbarEnabled ? <DevToolbar /> : null}
    </>
  );
}
