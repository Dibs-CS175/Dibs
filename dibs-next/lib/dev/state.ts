'use client';

import { useSyncExternalStore } from 'react';
import { ERROR_CODES, type ErrorCode } from '@/lib/result';

export type DevRole = 'signed_out' | 'student' | 'admin';
export type StubMode = 'normal' | 'empty' | 'error' | 'slow';
/** `all`: the mode applies to every stub. `actions`: queries stay normal so a loaded screen can show an action's error. */
export type StubScope = 'all' | 'actions';
/** `demo`: fixture versions in lib/demo (the working mockup). `live`: the team's code in lib/live. */
export type DataSource = 'demo' | 'live';

export interface DevState {
  source: DataSource;
  role: DevRole;
  mode: StubMode;
  errorCode: ErrorCode;
  scope: StubScope;
  /** Campus the stubs pretend the signed-in user (or visitor) belongs to. */
  campusId: string;
}

const KEY = 'dibs-dev-state';
const DEFAULT: DevState = {
  source: process.env.NEXT_PUBLIC_DATA_SOURCE === 'live' ? 'live' : 'demo',
  role: 'signed_out',
  mode: 'normal',
  errorCode: 'UNKNOWN',
  scope: 'all',
  campusId: 'riverside',
};

let state: DevState = DEFAULT;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...DEFAULT, ...(JSON.parse(raw) as Partial<DevState>) };
    if (state.source !== 'demo' && state.source !== 'live') state = { ...state, source: DEFAULT.source };
    if (!ERROR_CODES.includes(state.errorCode)) state = { ...state, errorCode: DEFAULT.errorCode };
  } catch {
    // Storage blocked: keep defaults.
  }
}

export function getDevState(): DevState {
  load();
  return state;
}

export function setDevState(patch: Partial<DevState>) {
  load();
  state = { ...state, ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage blocked: state lives for this tab only.
  }
  listeners.forEach((l) => l());
}

/** Puts every preview control back to its default. */
export function resetDevState() {
  setDevState(DEFAULT);
}

export function subscribeDevState(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Re-renders when the preview controls change data source, role, stub mode or error code. */
export function useDevState(): DevState {
  return useSyncExternalStore(subscribeDevState, getDevState, () => DEFAULT);
}

export const devToolbarEnabled = process.env.NEXT_PUBLIC_DEV_TOOLBAR === 'true';
