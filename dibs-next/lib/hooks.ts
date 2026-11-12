'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ErrorCode, Result } from '@/lib/result';
import { useDevState } from '@/lib/dev/state';
import { runAsQuery } from '@/lib/dev/simulate';

export type QueryState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: { code: ErrorCode; message: string } }
  | { status: 'data'; data: T };

export interface QueryOptions<T> {
  /**
   * Refetch every `pollMs` without going back to loading. Polling waits for the first load,
   * skips while the tab is hidden, and stops after a failed refetch until the tab is shown again.
   */
  pollMs?: number;
  /** Combines the data on screen with a refetched result. Defaults to replacing it. */
  merge?: (current: T, next: T) => T;
}

/**
 * Runs a query and tracks loading, error and data. Re-runs when `deps` change or when the
 * dev toolbar changes role or stub mode, so every state can be previewed.
 */
export function useQuery<T>(
  fn: () => Promise<Result<T>>,
  deps: unknown[] = [],
  options: QueryOptions<T> = {},
) {
  const dev = useDevState();
  const [state, setState] = useState<QueryState<T>>({ status: 'loading' });
  const [nonce, setNonce] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const mergeRef = useRef(options.merge);
  mergeRef.current = options.merge;
  const statusRef = useRef(state.status);
  statusRef.current = state.status;
  const { pollMs } = options;

  useEffect(() => {
    let live = true;
    setState({ status: 'loading' });
    runAsQuery(fnRef.current).then((r) => {
      if (!live) return;
      setState(r.ok ? { status: 'data', data: r.data } : { status: 'error', error: r.error });
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce, dev.source, dev.role, dev.mode, dev.errorCode, dev.scope, dev.campusId]);

  useEffect(() => {
    if (!pollMs) return;
    let live = true;
    let inFlight = false;
    let failed = false;
    const tick = async () => {
      if (!live || inFlight || failed || document.hidden || statusRef.current !== 'data') return;
      inFlight = true;
      const r = await runAsQuery(fnRef.current);
      inFlight = false;
      if (!live) return;
      if (!r.ok) {
        // Keep showing what we have; a failed refetch should not replace the list with an error.
        failed = true;
        return;
      }
      setState((prev) => {
        if (prev.status !== 'data') return prev;
        const merge = mergeRef.current;
        const data = merge ? merge(prev.data, r.data) : r.data;
        return data === prev.data ? prev : { status: 'data', data };
      });
    };
    const id = window.setInterval(() => void tick(), pollMs);
    const onVisibility = () => {
      if (document.hidden) return;
      failed = false;
      void tick();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      live = false;
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollMs, ...deps, nonce, dev.source, dev.role, dev.mode, dev.errorCode, dev.scope, dev.campusId]);

  const retry = useCallback(() => setNonce((n) => n + 1), []);
  const setData = useCallback((data: T) => setState({ status: 'data', data }), []);
  /** Changes the data on screen from its latest value, so it cannot undo a refetch that just landed. */
  const updateData = useCallback(
    (fn: (current: T) => T) =>
      setState((prev) => (prev.status === 'data' ? { status: 'data', data: fn(prev.data) } : prev)),
    [],
  );
  return { state, retry, setData, updateData };
}

/**
 * Wraps an action. `pending` stays true until the Result returns, and `run` ignores calls
 * while pending, so a double click cannot submit twice.
 */
export function useAction<A extends unknown[], T>(fn: (...args: A) => Promise<Result<T>>) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{ code: ErrorCode; message: string } | null>(null);
  const busy = useRef(false);

  const run = useCallback(
    async (...args: A): Promise<Result<T> | null> => {
      if (busy.current) return null;
      busy.current = true;
      setPending(true);
      setError(null);
      try {
        const r = await fn(...args);
        if (!r.ok) setError(r.error);
        return r;
      } finally {
        busy.current = false;
        setPending(false);
      }
    },
    [fn],
  );

  return { run, pending, error, clearError: () => setError(null) };
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}
