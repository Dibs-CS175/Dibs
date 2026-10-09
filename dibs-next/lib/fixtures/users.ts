import type { User } from '@/lib/types';

// Fictional people only.
export const FIXTURE_NOW = '2026-10-08T19:00:00Z';

export const me: User = {
  id: 'u_me',
  firstName: 'Alex',
  lastInitial: 'D',
  email: 'alex.d@ucr.edu',
  housingType: 'hall',
  role: 'student',
  verified: true,
  rating: 4.9,
  tradesCount: 11,
  memberSince: '2025-09-20T17:00:00Z',
};

export const adminUser: User = {
  id: 'u_admin',
  firstName: 'Jordan',
  lastInitial: 'K',
  email: 'jordan.k@ucr.edu',
  housingType: 'off_campus',
  role: 'admin',
  verified: true,
  rating: 5,
  tradesCount: 0,
  memberSince: '2025-08-01T17:00:00Z',
};

/** The account that owns Dibs Goods listings. */
export const goodsAccount: User = {
  id: 'u_goods',
  firstName: 'Dibs Goods',
  lastInitial: '',
  email: 'goods@dibs.example',
  housingType: null,
  role: 'admin',
  verified: true,
  rating: 4.8,
  tradesCount: 214,
  memberSince: '2025-08-01T17:00:00Z',
};

const s = (
  n: number,
  firstName: string,
  lastInitial: string,
  housingType: User['housingType'],
  rating: number,
  tradesCount: number,
  memberSince: string,
): User => ({
  id: `u_s${String(n).padStart(2, '0')}`,
  firstName,
  lastInitial,
  email: `${firstName.toLowerCase()}.${lastInitial.toLowerCase()}@ucr.edu`,
  housingType,
  role: 'student',
  verified: true,
  rating,
  tradesCount,
  memberSince,
});

export const sellers: User[] = [
  s(1, 'Maya', 'R', 'hall', 4.9, 23, '2025-09-15T17:00:00Z'),
  s(2, 'Jon', 'P', 'off_campus', 4.8, 17, '2025-09-15T17:00:00Z'),
  s(3, 'Priya', 'S', 'campus_apartment', 5.0, 31, '2025-09-22T17:00:00Z'),
  s(4, 'Diego', 'M', 'off_campus', 4.7, 9, '2026-01-10T17:00:00Z'),
  s(5, 'Aaliyah', 'T', 'hall', 4.9, 14, '2025-09-29T17:00:00Z'),
  s(6, 'Kenji', 'W', 'campus_apartment', 4.8, 12, '2026-03-30T17:00:00Z'),
  s(7, 'Sofia', 'G', 'commuter', 4.6, 6, '2026-04-02T17:00:00Z'),
  s(8, 'Marcus', 'L', 'off_campus', 4.9, 27, '2025-09-15T17:00:00Z'),
  s(9, 'Hana', 'K', 'hall', 5.0, 8, '2026-01-12T17:00:00Z'),
  s(10, 'Tomás', 'V', 'campus_apartment', 4.7, 19, '2025-09-18T17:00:00Z'),
  s(11, 'Imani', 'B', 'off_campus', 4.9, 22, '2025-09-25T17:00:00Z'),
  s(12, 'Ravi', 'N', 'off_campus', 4.8, 15, '2026-01-08T17:00:00Z'),
];

export const users: User[] = [me, adminUser, goodsAccount, ...sellers];
