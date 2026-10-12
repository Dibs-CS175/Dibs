import type { CreditLedgerEntry } from '@/lib/types';

/**
 * Referral credit history. Amounts are 0: the credit value is a business value the team has not set,
 * and it does not live in the price table yet.
 */
export const creditLedger: CreditLedgerEntry[] = [
  { id: 'cr1', userId: 'u_me', cents: 0, reason: 'referral_given', createdAt: '2026-09-20T18:00:00Z' },
  { id: 'cr2', userId: 'u_s09', cents: 0, reason: 'referral_received', createdAt: '2026-09-20T18:00:00Z' },
  { id: 'cr3', userId: 'u_me', cents: 0, reason: 'referral_given', createdAt: '2026-10-01T18:00:00Z' },
  { id: 'cr4', userId: 'u_s05', cents: 0, reason: 'referral_received', createdAt: '2026-10-01T18:00:00Z' },
  { id: 'cr5', userId: 'u_s01', cents: 0, reason: 'referral_given', createdAt: '2026-10-04T18:00:00Z' },
  { id: 'cr6', userId: 'u_s02', cents: 0, reason: 'referral_received', createdAt: '2026-10-04T18:00:00Z' },
];
