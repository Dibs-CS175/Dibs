'use client';

import { useState } from 'react';
import { Wrench, X } from 'lucide-react';
import { setDevState, useDevState, type DevRole, type StubMode, type StubScope } from '@/lib/dev/state';
import { ERROR_CODES, type ErrorCode } from '@/lib/result';
// Dev-only: the toolbar reads the campus list straight from fixtures so it keeps working in error mode.
import { campuses } from '@/lib/fixtures/campuses';
import { cn } from '@/lib/utils';

const ROLES: { id: DevRole; label: string }[] = [
  { id: 'signed_out', label: 'Signed out' },
  { id: 'student', label: 'Student' },
  { id: 'admin', label: 'Admin' },
];
const MODES: { id: StubMode; label: string }[] = [
  { id: 'normal', label: 'Normal' },
  { id: 'empty', label: 'Empty' },
  { id: 'error', label: 'Error' },
  { id: 'slow', label: 'Slow (3 s)' },
];

/** Dev-only panel. Rendered when NEXT_PUBLIC_DEV_TOOLBAR=true. */
export function DevToolbar() {
  const dev = useDevState();
  const [open, setOpen] = useState(false);
  const select = 'min-h-[36px] w-full rounded-md border border-line bg-surface px-2 text-sm text-ink';

  return (
    <div className="fixed bottom-3 left-3 z-[70] text-ink">
      {open ? (
        <div
          role="region"
          aria-label="Dev toolbar"
          className="w-64 rounded-card border border-line bg-surface p-3 shadow-2"
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Dev toolbar</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close dev toolbar"
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-sunk"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <label className="flex flex-col gap-1 font-semibold">
              Role
              <select
                className={select}
                value={dev.role}
                onChange={(e) => setDevState({ role: e.target.value as DevRole })}
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 font-semibold">
              Campus
              <select
                className={select}
                value={dev.campusId}
                onChange={(e) => setDevState({ campusId: e.target.value })}
              >
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 font-semibold">
              Stub mode
              <select
                className={select}
                value={dev.mode}
                onChange={(e) => setDevState({ mode: e.target.value as StubMode })}
              >
                {MODES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 font-semibold">
              Applies to
              <select
                className={select}
                value={dev.scope}
                onChange={(e) => setDevState({ scope: e.target.value as StubScope })}
              >
                <option value="all">Queries and actions</option>
                <option value="actions">Actions only</option>
              </select>
            </label>
            <label className={cn('flex flex-col gap-1 font-semibold', dev.mode !== 'error' && 'opacity-60')}>
              Error code
              <select
                className={select}
                value={dev.errorCode}
                onChange={(e) => setDevState({ errorCode: e.target.value as ErrorCode })}
              >
                {ERROR_CODES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-line bg-surface px-3 text-xs font-bold shadow-2"
          aria-label={`Open dev toolbar. Role ${dev.role}, campus ${dev.campusId}, mode ${dev.mode}`}
        >
          <Wrench className="h-4 w-4" aria-hidden /> {dev.role} · {dev.campusId} · {dev.mode}
          {dev.mode === 'error' ? ` · ${dev.errorCode}` : ''}
          {dev.scope === 'actions' && dev.mode !== 'normal' ? ' · actions' : ''}
        </button>
      )}
    </div>
  );
}
