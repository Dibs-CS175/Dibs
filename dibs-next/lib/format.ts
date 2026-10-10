import { DISPLAY_TIME_ZONE } from '@/lib/config/app';
import type { Cents, ISODate } from '@/lib/types';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** The only way money is shown. Input is integer cents. */
export function formatMoney(cents: Cents): string {
  return usd.format(cents / 100);
}

export function formatDate(
  iso: ISODate,
  opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' },
): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: DISPLAY_TIME_ZONE, ...opts }).format(new Date(iso));
}

export function formatDateTime(iso: ISODate): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: DISPLAY_TIME_ZONE,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatTime(iso: ISODate): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: DISPLAY_TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatWindow(startsAt: ISODate, endsAt: ISODate): string {
  return `${formatDate(startsAt, { weekday: 'short', month: 'short', day: 'numeric' })}, ${formatTime(startsAt)} to ${formatTime(endsAt)}`;
}

export function timeAgo(iso: ISODate, now: Date = new Date()): string {
  const mins = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  if (mins < 60 * 24) return `${Math.floor(mins / 60)}h ago`;
  if (mins < 60 * 48) return 'Yesterday';
  return formatDate(iso);
}

export function shortName(u: { firstName: string; lastInitial: string }): string {
  return u.lastInitial ? `${u.firstName} ${u.lastInitial}.` : u.firstName;
}

export function labelFor<T extends string>(
  list: { id: T; label: string }[],
  id: T | null | undefined,
): string {
  return list.find((x) => x.id === id)?.label ?? '';
}

/** Basis points as a percent label: 6000 becomes "60%". Display only. */
export function formatPercent(bps: number): string {
  return `${Number((bps / 100).toFixed(2))}%`;
}
