import { simulate } from '@/lib/dev';
import { reportSubjects, reports } from '@/lib/fixtures/orders';
import type { Result } from '@/lib/result';
import type { ReportView } from '@/lib/types';

/** Admin: open problem reports. */
export async function getOpenReports(): Promise<Result<ReportView[]>> {
  // STUB(reports): replace with real implementation
  const data = reports
    .filter((r) => r.status === 'open')
    .map((r) => ({ report: r, subject: reportSubjects[r.id] ?? r.id }));
  return simulate(data, []);
}
