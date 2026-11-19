// Reads the public part of seller profiles for listing queries.
// Row-level security on public.users only lets a user read their own row, so other students' names
// and verified badges come from the seller_profiles SQL function instead of a join.
// Not a server action file, so it can export plain functions.

export interface SellerRow {
  id: string;
  first_name: string;
  last_initial: string;
  verified: boolean;
  trades_count: number;
  member_since: string;
}

interface RpcClient {
  rpc(
    fn: string,
    args: Record<string, unknown>,
  ): PromiseLike<{ data: unknown; error: { message: string } | null }>;
}

/**
 * Seller profiles by user id, for sellers on the signed-in user's campus. A seller that is missing
 * from the map (a Dibs Goods listing, another campus, or a failed read) is shown without a profile.
 */
export async function loadSellers(
  supabase: RpcClient,
  sellerIds: (string | null | undefined)[],
): Promise<Map<string, SellerRow>> {
  const ids = [...new Set(sellerIds.filter((id): id is string => typeof id === 'string' && id !== ''))];
  if (ids.length === 0) return new Map();

  const { data, error } = await supabase.rpc('seller_profiles', { p_ids: ids });
  if (error || !Array.isArray(data)) return new Map();
  return new Map((data as SellerRow[]).map((row) => [row.id, row]));
}
