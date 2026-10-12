'use client';

import { Toaster } from 'sonner';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { DevToolbar } from '@/components/dev/dev-toolbar';
import { CampusProvider } from '@/lib/campus';
import { devToolbarEnabled } from '@/lib/dev/state';
import { useQuery } from '@/lib/hooks';
import { getCurrentCampus } from '@/lib/queries/campus';
import { useSession } from '@/lib/session';

/** App chrome. Reads the session and campus once and hands them to presentational pieces. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { state, retry } = useSession();
  const current = useQuery(() => getCurrentCampus(), []);
  const user = state.status === 'data' && state.data ? state.data.user : null;
  const campus =
    state.status === 'data' && state.data
      ? state.data.campus
      : current.state.status === 'data'
        ? current.state.data
        : null;
  const error =
    campus === null
      ? current.state.status === 'error'
        ? current.state.error
        : state.status === 'error'
          ? state.error
          : null
      : null;
  return (
    <CampusProvider
      value={{
        campus,
        error,
        retry: () => {
          retry();
          current.retry();
        },
      }}
    >
      <SiteHeader user={user} campusName={campus?.name ?? null} />
      <main id="main" tabIndex={-1} className="min-h-[70vh] focus:outline-none">
        {children}
      </main>
      <SiteFooter />
      <Toaster position="bottom-right" richColors closeButton toastOptions={{ className: 'font-sans' }} />
      {devToolbarEnabled ? <DevToolbar /> : null}
    </CampusProvider>
  );
}
