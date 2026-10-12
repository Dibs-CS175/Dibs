'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { errorMessage } from '@/lib/errorMessages';
import { useQuery } from '@/lib/hooks';
import { getSession } from '@/lib/queries/users';
import type { UserRole } from '@/lib/types';
import { ErrorState, PageSkeleton } from '@/components/states';

export function useSession() {
  return useQuery(() => getSession(), []);
}

/**
 * Guard for protected routes. Calls getSession(); signed-out users go to Verify with a `next`
 * parameter so they come back afterward. `role="admin"` also requires the admin role.
 */
export function RequireSession({ role, children }: { role?: UserRole; children: React.ReactNode }) {
  const { state, retry } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const signedOut = state.status === 'data' && state.data === null;
  const forbidden =
    state.status === 'data' && state.data !== null && role === 'admin' && state.data.user.role !== 'admin';
  // Once the guard has passed, a background re-check keeps the page mounted so in-progress forms keep their state.
  const passed = useRef(false);
  if (state.status === 'data') passed.current = state.data !== null && !forbidden;

  useEffect(() => {
    if (signedOut) router.replace(`/verify?next=${encodeURIComponent(pathname)}`);
  }, [signedOut, router, pathname]);

  if (state.status === 'loading' && passed.current) return <>{children}</>;
  if (state.status === 'loading' || signedOut) return <PageSkeleton />;
  if (state.status === 'error') return <ErrorState message={errorMessage(state.error)} onRetry={retry} />;
  if (forbidden) {
    return (
      <div className="container py-16">
        <ErrorState
          title="Admins only"
          message="This area is for Dibs staff. Switch to an admin account to continue."
        />
      </div>
    );
  }
  return <>{children}</>;
}
