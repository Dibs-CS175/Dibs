import type { User } from '@/lib/types';

// Fictional people only.

const u = (
  id: string,
  campusId: string,
  firstName: string,
  lastInitial: string,
  domain: string,
  housingType: User['housingType'],
  tradesCount: number,
  memberSince: string,
  referralCode: string,
  role: User['role'] = 'student',
): User => ({
  id,
  campusId,
  firstName,
  lastInitial,
  email: `${firstName.toLowerCase()}.${lastInitial.toLowerCase() || 'x'}@${domain}`,
  housingType,
  role,
  verified: true,
  tradesCount,
  memberSince,
  referralCode,
});

export const me = u(
  'u_me',
  'riverside',
  'Alex',
  'D',
  'ucr.edu',
  'hall',
  11,
  '2025-09-20T17:00:00Z',
  'ALEX-7KD2',
);
export const adminUser = u(
  'u_admin',
  'riverside',
  'Jordan',
  'K',
  'ucr.edu',
  'off_campus',
  0,
  '2025-08-01T17:00:00Z',
  'JORDAN-3QP8',
  'admin',
);

/** Accounts that own Dibs Goods listings, one per campus. */
export const goodsAccounts: User[] = [
  {
    ...u(
      'u_goods',
      'riverside',
      'Dibs Goods',
      '',
      'dibs.example',
      null,
      214,
      '2025-08-01T17:00:00Z',
      'GOODS-R',
    ),
    role: 'admin',
  },
  {
    ...u(
      'u_goods_sb',
      'san-bernardino',
      'Dibs Goods',
      '',
      'dibs.example',
      null,
      12,
      '2026-08-01T17:00:00Z',
      'GOODS-S',
    ),
    role: 'admin',
  },
];

export const sellers: User[] = [
  u('u_s01', 'riverside', 'Maya', 'R', 'ucr.edu', 'hall', 23, '2025-09-15T17:00:00Z', 'MAYA-R81'),
  u('u_s02', 'riverside', 'Jon', 'P', 'ucr.edu', 'off_campus', 17, '2025-09-15T17:00:00Z', 'JON-P22'),
  u(
    'u_s03',
    'riverside',
    'Priya',
    'S',
    'ucr.edu',
    'campus_apartment',
    31,
    '2025-09-22T17:00:00Z',
    'PRIYA-S09',
  ),
  u('u_s04', 'riverside', 'Diego', 'M', 'ucr.edu', 'off_campus', 9, '2026-01-10T17:00:00Z', 'DIEGO-M44'),
  u('u_s05', 'riverside', 'Aaliyah', 'T', 'ucr.edu', 'hall', 14, '2025-09-29T17:00:00Z', 'AALI-T15'),
  u(
    'u_s06',
    'riverside',
    'Kenji',
    'W',
    'ucr.edu',
    'campus_apartment',
    12,
    '2026-03-30T17:00:00Z',
    'KENJI-W60',
  ),
  u('u_s07', 'riverside', 'Sofia', 'G', 'ucr.edu', 'commuter', 6, '2026-04-02T17:00:00Z', 'SOFIA-G07'),
  u('u_s08', 'riverside', 'Marcus', 'L', 'ucr.edu', 'off_campus', 27, '2025-09-15T17:00:00Z', 'MARC-L38'),
  u('u_s09', 'riverside', 'Hana', 'K', 'ucr.edu', 'hall', 8, '2026-01-12T17:00:00Z', 'HANA-K19'),
  u(
    'u_s10',
    'san-bernardino',
    'Tomás',
    'V',
    'csusb.edu',
    'campus_apartment',
    19,
    '2025-09-18T17:00:00Z',
    'TOMAS-V10',
  ),
  u(
    'u_s11',
    'san-bernardino',
    'Imani',
    'B',
    'csusb.edu',
    'off_campus',
    22,
    '2025-09-25T17:00:00Z',
    'IMANI-B11',
  ),
  u(
    'u_s12',
    'san-bernardino',
    'Ravi',
    'N',
    'csusb.edu',
    'off_campus',
    15,
    '2026-01-08T17:00:00Z',
    'RAVI-N12',
  ),
];

export const users: User[] = [me, adminUser, ...goodsAccounts, ...sellers];

export const findUser = (id: string): User => users.find((x) => x.id === id) ?? sellers[0]!;
