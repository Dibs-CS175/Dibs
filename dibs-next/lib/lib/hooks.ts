'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ErrorCode, Result } from '@/lib/result';
import { useDevState } from '@/lib/dev/state';
import { runAsQuery } from '@/lib/dev/simulate';

export type QueryState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: { code: ErrorCode; message: string } }
  | { status: 'data'; data: T };

/**
 * Runs a query and tracks loading, error and data. Re-runs when `deps` change or when the
 * dev toolbar changes role or stub mode, so every state can be previewed.
 */
export function useQuery<T>(fn: () => Promise<Result<T>>, deps: unknown[] = []) {
  const dev = useDevState();
  const [state, setState] = useState<QueryState<T>>({ status: 'loading' });
  const [nonce, setNonce] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

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
  }, [...deps, nonce, dev.role, dev.mode, dev.errorCode, dev.scope, dev.campusId]);

  const retry = useCallback(() => setNonce((n) => n + 1), []);
  const setData = useCallback((data: T) => setState({ status: 'data', data }), []);
  return { state, retry, setData };
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
