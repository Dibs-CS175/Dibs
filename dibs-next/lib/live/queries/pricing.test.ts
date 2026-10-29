import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Result } from '@/lib/result';
import type { Session, SummerHoldInput } from '@/lib/types';

// getSession is a users stub until Brian builds it; each test picks the session it needs
const session = vi.hoisted(() => ({ current: null as unknown }));
vi.mock('@/lib/live/queries/users', () => ({
  getSession: async () => session.current,
}));

import {
  getCheckoutQuote,
  getSellerPayoutQuote,
  getSummerHoldOffers,
  getSummerHoldQuote,
  getSummerHoldTeaser,
} from './pricing';

const signedIn = { ok: true, data: { user: {}, campus: { id: 'riverside' } } } as Result<Session | null>;
const asOf = (iso: string) => vi.stubEnv('DIBS_AS_OF', iso);
const errorCode = (r: Result<unknown>) => (r.ok ? null : r.error.code);

afterEach(() => {
  vi.unstubAllEnvs();
  session.current = null;
});

describe('price row by date', () => {
  it.each([
    ['2026-10-23T12:00:00-07:00', 22100], // before the season starts: next season's early tier
    ['2027-04-16T09:00:00-07:00', 23100],
  ])('teaser at %s is %i cents', async (iso, cents) => {
    asOf(iso);
    expect(await getSummerHoldTeaser('riverside')).toEqual({
      ok: true,
      data: { itemCount: 4, totalCents: cents },
    });
  });

  it('hides the teaser after registration closes', async () => {
    asOf('2027-06-08T12:00:00-07:00');
    expect(await getSummerHoldTeaser('riverside')).toEqual({ ok: true, data: null });
  });

  it('hides the teaser for a campus with no prices', async () => {
    expect(await getSummerHoldTeaser('nowhere')).toEqual({ ok: true, data: null });
  });

  it('keeps marketplace fees after the last season ends', async () => {
    asOf('2030-01-01T12:00:00-08:00');
    session.current = signedIn;
    const r = await getSellerPayoutQuote(2000);
    expect(r.ok && r.data.totalCents).toBe(1900);
  });
});

describe('getSellerPayoutQuote', () => {
  it('lines add up to what the seller receives', async () => {
    session.current = signedIn;
    const r = await getSellerPayoutQuote(2000);
    if (!r.ok) throw new Error(r.error.message);
    expect(r.data.totalCents).toBe(1900);
    expect(r.data.lines.reduce((s, l) => s + l.cents, 0)).toBe(1900);
  });

  it('quotes $0 for a free item', async () => {
    session.current = signedIn;
    const r = await getSellerPayoutQuote(0);
    expect(r.ok && r.data.totalCents).toBe(0);
  });

  it('rejects a negative price', async () => {
    session.current = signedIn;
    expect(errorCode(await getSellerPayoutQuote(-5))).toBe('VALIDATION');
  });

  it('needs a signed-in seller', async () => {
    session.current = { ok: true, data: null };
    expect(errorCode(await getSellerPayoutQuote(2000))).toBe('NOT_SIGNED_IN');
  });
});

describe('getSummerHoldQuote', () => {
  const input: SummerHoldInput = {
    campusId: 'riverside',
    housingType: 'off_campus',
    standardCount: 2,
    largeCount: 1,
    fullService: false,
    addOnKeys: ['protect_plus'],
    referralCode: '',
  };

  it('charges the off-campus fee for off-campus housing', async () => {
    asOf('2027-04-01T12:00:00-07:00');
    const r = await getSummerHoldQuote(input);
    if (!r.ok) throw new Error(r.error.message);
    expect(r.data.totalCents).toBe(23100);
    expect(r.data.lines.map((l) => l.kind)).toEqual(['item', 'item', 'fee', 'addon', 'fee']);
  });

  it('skips the off-campus fee for a hall', async () => {
    asOf('2027-04-01T12:00:00-07:00');
    const r = await getSummerHoldQuote({ ...input, housingType: 'hall' });
    expect(r.ok && r.data.totalCents).toBe(22100);
  });

  it('returns pricing errors instead of throwing', async () => {
    asOf('2027-04-01T12:00:00-07:00');
    expect(errorCode(await getSummerHoldQuote({ ...input, fullService: true }))).toBe('VALIDATION');
    expect(errorCode(await getSummerHoldQuote({ ...input, campusId: 'nowhere' }))).toBe('NOT_FOUND');
  });
});

describe('getSummerHoldOffers', () => {
  it('returns the tier in effect and every add-on', async () => {
    asOf('2027-04-16T09:00:00-07:00');
    const r = await getSummerHoldOffers('riverside');
    if (!r.ok) throw new Error(r.error.message);
    expect(r.data.currentTier.key).toBe('standard');
    expect(r.data.addOns.map((a) => a.key)).toEqual(['protect_plus', 'priority_window', 'delivery']);
  });

  it('fails once registration has closed', async () => {
    asOf('2027-06-08T12:00:00-07:00');
    expect(errorCode(await getSummerHoldOffers('riverside'))).toBe('DEADLINE_PASSED');
  });
});

describe('getCheckoutQuote', () => {
  it('stays a stub until the listings table exists', async () => {
    expect(errorCode(await getCheckoutQuote('l1'))).toBe('NOT_IMPLEMENTED');
  });
});
