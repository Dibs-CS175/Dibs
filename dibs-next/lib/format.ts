import type { Cents, ISODate } from '@/lib/types';

// Display helpers only. Dates are stored in UTC and shown in the campus time zone, which callers get
// from useTimeZone() in lib/campus.tsx.

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** The only way money is shown. Input is integer cents. */
export function formatMoney(cents: Cents): string {
  return usd.format(cents / 100);
}

export function formatDate(
  iso: ISODate,
  tz: string,
  opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' },
): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, ...opts }).format(new Date(iso));
}

export function formatDateTime(iso: ISODate, tz: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatTime(iso: ISODate, tz: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' }).format(
    new Date(iso),
  );
}

export function formatWindow(startsAt: ISODate, endsAt: ISODate, tz: string): string {
  return `${formatDate(startsAt, tz, { weekday: 'short', month: 'short', day: 'numeric' })}, ${formatTime(startsAt, tz)} to ${formatTime(endsAt, tz)}`;
}

/** A business date that may not be set yet. */
export function formatMaybeDate(iso: ISODate | null | undefined, tz: string): string {
  return iso
    ? formatDate(iso, tz, { month: 'long', day: 'numeric', year: 'numeric' })
    : 'date to be announced';
}

export function timeAgo(iso: ISODate, tz: string, now: Date = new Date()): string {
  const mins = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  if (mins < 60 * 24) return `${Math.floor(mins / 60)}h ago`;
  if (mins < 60 * 48) return 'Yesterday';
  return formatDate(iso, tz);
}

/** Time left until `endsAt`, for countdowns. Display only. */
export function timeLeft(
  endsAt: ISODate,
  now: Date = new Date(),
): { days: number; hours: number; minutes: number; done: boolean } {
  const ms = Math.max(0, new Date(endsAt).getTime() - now.getTime());
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms % 86_400_000) / 3_600_000),
    minutes: Math.floor((ms % 3_600_000) / 60_000),
    done: ms === 0,
  };
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
