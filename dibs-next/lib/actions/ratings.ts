import { simulate } from '@/lib/dev';
import { me } from '@/lib/fixtures/users';
import type { Result } from '@/lib/result';
import type { Rating } from '@/lib/types';

export async function submitRating(
  orderId: string,
  toId: string,
  stars: number,
  tags: string[],
): Promise<Result<Rating>> {
  // STUB(ratings): replace with real implementation
  return simulate<Rating>({ orderId, fromId: me.id, toId, stars, tags });
}
