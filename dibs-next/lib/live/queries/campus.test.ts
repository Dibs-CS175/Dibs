import { afterEach, describe, expect, it, vi } from 'vitest';

// A fake Supabase client: each table returns what the test put in `db`.
const db = vi.hoisted(() => ({
  user: { id: 'u1' } as { id: string } | null,
  tables: {} as Record<string, { data: unknown; error: { message: string } | null }>,
}));

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => ({
    auth: { getUser: async () => ({ data: { user: db.user } }) },
    from: (table: string) => {
      const result = () => db.tables[table] ?? { data: null, error: null };
      const chain: Record<string, unknown> = {};
      for (const m of ['select', 'eq', 'order', 'limit']) chain[m] = () => chain;
      chain.maybeSingle = async () => result();
      chain.returns = async () => result();
      return chain;
    },
  }),
}));

import { getCampus, getCurrentCampus, getMeetupSpots } from './campus';

const riverside = { id: 'riverside', name: 'Riverside', email_domain: 'ucr.edu', timezone: 'America/Los_Angeles' };
const csusb = { id: 'san-bernardino', name: 'San Bernardino', email_domain: 'csusb.edu', timezone: 'America/Los_Angeles' };
const code = (r: { ok: boolean; error?: { code: string } }) => (r.ok ? null : r.error?.code);

afterEach(() => {
  db.user = { id: 'u1' };
  db.tables = {};
});

describe('getCampus', () => {
  it('maps a campus row', async () => {
    db.tables.campuses = { data: riverside, error: null };
    expect(await getCampus('riverside')).toEqual({
      ok: true,
      data: { id: 'riverside', name: 'Riverside', emailDomain: 'ucr.edu', timezone: 'America/Los_Angeles' },
    });
  });

  it('reports NOT_FOUND, UNKNOWN and VALIDATION', async () => {
    db.tables.campuses = { data: null, error: null };
    expect(code(await getCampus('nope'))).toBe('NOT_FOUND');
    db.tables.campuses = { data: null, error: { message: 'boom' } };
    expect(code(await getCampus('riverside'))).toBe('UNKNOWN');
    expect(code(await getCampus(''))).toBe('VALIDATION');
  });
});

describe('getCurrentCampus', () => {
  it('uses the signed-in user campus', async () => {
    db.tables.users = { data: { campus_id: 'san-bernardino' }, error: null };
    db.tables.campuses = { data: csusb, error: null };
    const r = await getCurrentCampus();
    expect(r.ok && r.data.id).toBe('san-bernardino');
  });

  it('falls back to the site default when signed out', async () => {
    db.user = null;
    db.tables.campuses = { data: riverside, error: null };
    const r = await getCurrentCampus();
    expect(r.ok && r.data.id).toBe('riverside');
  });

  it('falls back when the user campus is unknown', async () => {
    db.tables.users = { data: { campus_id: 'unknown' }, error: null };
    db.tables.campuses = { data: null, error: null };
    expect(code(await getCurrentCampus())).toBe('NOT_FOUND');
  });

  it('reports UNKNOWN when the default cannot load', async () => {
    db.user = null;
    db.tables.campuses = { data: null, error: { message: 'boom' } };
    expect(code(await getCurrentCampus())).toBe('UNKNOWN');
  });
});

describe('getMeetupSpots', () => {
  it('maps rows and fills a missing description', async () => {
    db.tables.meetup_spots = {
      data: [
        { id: 's1', campus_id: 'riverside', name: 'Library', description: 'Front steps' },
        { id: 's2', campus_id: 'riverside', name: 'Student Rec', description: null },
      ],
      error: null,
    };
    expect(await getMeetupSpots('riverside')).toEqual({
      ok: true,
      data: [
        { id: 's1', campusId: 'riverside', name: 'Library', description: 'Front steps' },
        { id: 's2', campusId: 'riverside', name: 'Student Rec', description: '' },
      ],
    });
  });

  it('returns an empty list and reports errors', async () => {
    db.tables.meetup_spots = { data: [], error: null };
    expect(await getMeetupSpots('riverside')).toEqual({ ok: true, data: [] });
    db.tables.meetup_spots = { data: null, error: { message: 'boom' } };
    expect(code(await getMeetupSpots('riverside'))).toBe('UNKNOWN');
    expect(code(await getMeetupSpots(''))).toBe('VALIDATION');
  });
});
