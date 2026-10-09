import { simulate } from '@/lib/dev';
import type { Result } from '@/lib/result';
import type { Report } from '@/lib/types';

/** Reports a problem with an order. The backend pauses the Dibs Protect payment. */
export async function reportProblem(
  orderId: string,
  reason: string,
  details: string,
): Promise<Result<Report>> {
  // STUB(reports): replace with real implementation
  void details;
  return simulate<Report>({
    id: 'r_new',
    orderId,
    reason,
    status: 'open',
    createdAt: new Date().toISOString(),
  });
}

export async function reportListing(
  listingId: string,
  reason: string,
  details: string,
): Promise<Result<Report>> {
  // STUB(reports): replace with real implementation
  void details;
  return simulate<Report>({
    id: 'r_new',
    listingId,
    reason,
    status: 'open',
    createdAt: new Date().toISOString(),
  });
}

export async function resolveReport(reportId: string, note: string): Promise<Result<{ reportId: string }>> {
  // STUB(reports): replace with real implementation
  void note;
  return simulate({ reportId });
}
