'use client';

import { useSyncExternalStore } from 'react';
import type { ErrorCode } from '@/lib/result';

export type DevRole = 'signed_out' | 'student' | 'admin';
export type StubMode = 'normal' | 'empty' | 'error' | 'slow';
/** `all`: the mode applies to every stub. `actions`: queries stay normal so a loaded screen can show an action's error. */
export type StubScope = 'all' | 'actions';

export interface DevState {
  role: DevRole;
  mode: StubMode;
  errorCode: ErrorCode;
  scope: StubScope;
}

const KEY = 'dibs-dev-state';
const DEFAULT: DevState = { role: 'signed_out', mode: 'normal', errorCode: 'UNKNOWN', scope: 'all' };

let state: DevState = DEFAULT;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...DEFAULT, ...(JSON.parse(raw) as Partial<DevState>) };
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

export function subscribeDevState(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Re-renders when the dev toolbar changes role, stub mode or error code. */
export function useDevState(): DevState {
  return useSyncExternalStore(subscribeDevState, getDevState, () => DEFAULT);
}

export const devToolbarEnabled = process.env.NEXT_PUBLIC_DEV_TOOLBAR === 'true';
