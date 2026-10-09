import { simulate } from '@/lib/dev';
import { ratings } from '@/lib/fixtures/orders';
import type { Result } from '@/lib/result';
import type { Rating } from '@/lib/types';

export async function getRatingsForUser(userId: string): Promise<Result<Rating[]>> {
  // STUB(ratings): replace with real implementation
  return simulate(
    ratings.filter((r) => r.toId === userId),
    [],
  );
}
