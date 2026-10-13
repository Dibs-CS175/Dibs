'use client';

import { createContext, useContext } from 'react';
import type { ErrorCode } from '@/lib/result';
import type { Campus } from '@/lib/types';

export interface CampusState {
  campus: Campus | null;
  /** Set when neither the session nor getCurrentCampus() could load. */
  error: { code: ErrorCode; message: string } | null;
  retry: () => void;
}

/** The campus the app is showing. AppShell fills it from getSession() or getCurrentCampus(). */
const CampusContext = createContext<CampusState>({ campus: null, error: null, retry: () => undefined });

export const CampusProvider = CampusContext.Provider;

export function useCampus(): Campus | null {
  return useContext(CampusContext).campus;
}

export function useCampusState(): CampusState {
  return useContext(CampusContext);
}

/** Time zone for displaying dates. Falls back to UTC until the campus has loaded. */
export function useTimeZone(): string {
  return useContext(CampusContext).campus?.timezone ?? 'UTC';
}
