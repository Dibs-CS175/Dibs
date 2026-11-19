import { describe, expect, it } from 'vitest';
import { loadSellers, type SellerRow } from './sellers';

const A = '6f1b6c55-2a4f-4d0b-9a3e-1d2c3b4a5f60';
const B = '0b7c2e9a-5d14-4f3e-8a21-9c8d7e6f5a40';
const row = (id: string, first_name: string): SellerRow => ({
  id,
  first_name,
  last_initial: 'K',
  verified: true,
  trades_count: 2,
  member_since: '2026-01-10T17:00:00Z',
});

function fakeClient(result: { data: unknown; error: { message: string } | null }) {
  const calls: { fn: string; args: Record<string, unknown> }[] = [];
  return {
    calls,
    rpc: async (fn: string, args: Record<string, unknown>) => {
      calls.push({ fn, args });
      return result;
    },
  };
}

describe('loadSellers', () => {
  it('asks once for the distinct seller ids and maps the rows by id', async () => {
    const client = fakeClient({ data: [row(A, 'Maya'), row(B, 'Jon')], error: null });
    const sellers = await loadSellers(client, [A, B, A, null, undefined, '']);
    expect(client.calls).toEqual([{ fn: 'seller_profiles', args: { p_ids: [A, B] } }]);
    expect(sellers.get(A)?.first_name).toBe('Maya');
    expect(sellers.get(B)?.first_name).toBe('Jon');
  });

  it('does not call the database when there are no seller ids', async () => {
    const client = fakeClient({ data: [], error: null });
    expect((await loadSellers(client, [null, undefined])).size).toBe(0);
    expect(client.calls).toHaveLength(0);
  });

  it('returns no sellers when the read fails, so listings still load', async () => {
    const client = fakeClient({ data: null, error: { message: 'function does not exist' } });
    expect((await loadSellers(client, [A])).size).toBe(0);
  });
});
