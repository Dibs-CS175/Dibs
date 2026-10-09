import { simulate } from '@/lib/dev';
import { impactStats } from '@/lib/fixtures/impact';
import type { Result } from '@/lib/result';
import type { ImpactStats } from '@/lib/types';

export async function getImpactStats(): Promise<Result<ImpactStats>> {
  // STUB(impact): replace with real implementation
  return simulate(impactStats, { itemsKeptInUse: 0, estimatedPounds: 0, byCategory: [] });
}
