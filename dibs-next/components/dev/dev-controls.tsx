'use client';

import {
  setDevState,
  useDevState,
  type DataSource,
  type DevRole,
  type StubMode,
  type StubScope,
} from '@/lib/dev/state';
import { ERROR_CODES, type ErrorCode } from '@/lib/result';
// Dev-only: the controls read the campus list straight from fixtures so they keep working in error mode.
import { campuses } from '@/lib/fixtures/campuses';
import { cn } from '@/lib/utils';

const SOURCES: { id: DataSource; label: string }[] = [
  { id: 'demo', label: 'Demo (mockup data)' },
  { id: 'live', label: 'Live (our code)' },
];
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

/**
 * The preview controls, shared by the floating dev toolbar and the preview panel at /dev.
 * Role, campus, stub mode, scope and error code only steer the Demo versions. In Live, the team's code
 * decides who is signed in and what comes back, so those controls are disabled.
 */
export function DevControls({ className }: { className?: string }) {
  const dev = useDevState();
  const live = dev.source === 'live';
  const select =
    'min-h-[36px] w-full rounded-md border border-line bg-surface px-2 text-sm text-ink disabled:cursor-not-allowed';
  const demoOnly = cn('flex flex-col gap-1 font-semibold', live && 'opacity-50');

  return (
    <div className={cn('flex flex-col gap-2 text-sm', className)}>
      <label className="flex flex-col gap-1 font-semibold">
        Data source
        <select
          className={select}
          value={dev.source}
          onChange={(e) => setDevState({ source: e.target.value as DataSource })}
        >
          {SOURCES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      {live ? (
        <p className="text-xs text-muted">
          Live runs lib/live. Unbuilt functions show “Not built yet”. The controls below only affect Demo.
        </p>
      ) : null}
      <label className={demoOnly}>
        Role
        <select
          className={select}
          disabled={live}
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
      <label className={demoOnly}>
        Campus
        <select
          className={select}
          disabled={live}
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
      <label className={demoOnly}>
        Stub mode
        <select
          className={select}
          disabled={live}
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
      <label className={demoOnly}>
        Applies to
        <select
          className={select}
          disabled={live}
          value={dev.scope}
          onChange={(e) => setDevState({ scope: e.target.value as StubScope })}
        >
          <option value="all">Queries and actions</option>
          <option value="actions">Actions only</option>
        </select>
      </label>
      <label className={cn(demoOnly, !live && dev.mode !== 'error' && 'opacity-60')}>
        Error code
        <select
          className={select}
          disabled={live}
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
  );
}

/** Short summary of the current preview settings, for the toolbar pill. */
export function devSummary(dev: ReturnType<typeof useDevState>): string {
  if (dev.source === 'live') return 'Live · our code';
  const parts = ['Demo', dev.role, dev.campusId, dev.mode];
  if (dev.mode === 'error') parts.push(dev.errorCode);
  if (dev.scope === 'actions' && dev.mode !== 'normal') parts.push('actions');
  return parts.join(' · ');
}
