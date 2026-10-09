import type { GoodsItem, GoodsStatus } from '@/lib/types';

const g = (
  n: number,
  title: string,
  category: GoodsItem['category'],
  icon: string,
  price: number,
  cost: number | undefined,
  status: GoodsStatus,
  intakeDate: string,
  extra: Partial<GoodsItem> = {},
): GoodsItem => ({
  id: `g${String(n).padStart(2, '0')}`,
  title,
  category,
  photos: [`ph:${icon}:0`],
  priceCents: Math.round(price * 100),
  costCents: cost === undefined ? undefined : Math.round(cost * 100),
  status,
  intakeDate,
  ...extra,
});

// Goods are items Dibs owns (from move-out pickups and donations). Prices and costs here are item-level
// fixture values, not business fees.
export const goods: GoodsItem[] = [
  g(1, 'Mesh task chair', 'furniture', 'Armchair', 15, 4, 'listed', '2026-09-02T17:00:00Z'),
  g(2, 'Desk fan, 3 speed', 'dorm_essentials', 'Fan', 6, 1, 'listed', '2026-09-03T17:00:00Z'),
  g(3, 'Storage bins, set of 3', 'dorm_essentials', 'Archive', 4, 0, 'listed', '2026-09-03T17:00:00Z'),
  g(4, '22 in monitor', 'electronics', 'Monitor', 25, 6, 'listed', '2026-09-05T17:00:00Z', {
    serialNumber: 'MN22-4471-K',
  }),
  g(5, 'Bookcase, 3 shelf', 'furniture', 'Library', 12, 2, 'listed', '2026-09-06T17:00:00Z'),
  g(6, 'Microwave, 0.9 cu ft', 'kitchen', 'Microwave', 15, 3, 'listed', '2026-09-08T17:00:00Z'),
  g(7, 'Space heater', 'other', 'Heater', 10, 2, 'listed', '2026-09-09T17:00:00Z'),
  g(8, 'Desk lamp with USB', 'dorm_essentials', 'LampDesk', 5, 0, 'listed', '2026-09-10T17:00:00Z'),
  g(9, 'Cruiser bike', 'bikes_boards', 'Bike', 60, 15, 'listed', '2026-09-12T17:00:00Z', {
    serialNumber: 'WTU-0912-33',
  }),
  g(10, 'Laptop, 13 in', 'electronics', 'Laptop', 120, 40, 'holding', '2026-10-01T17:00:00Z', {
    serialNumber: 'C02-XK18-LP',
    holdUntil: '2026-10-31T07:00:00Z',
  }),
  g(11, 'Bluetooth speaker', 'electronics', 'Speaker', 15, 4, 'holding', '2026-10-02T17:00:00Z', {
    serialNumber: 'SPK-2210-9',
    holdUntil: '2026-11-01T07:00:00Z',
  }),
  g(12, 'Road bike', 'bikes_boards', 'Bike', 90, 25, 'holding', '2026-10-03T17:00:00Z', {
    serialNumber: 'WTU-1003-71',
    holdUntil: '2026-11-02T07:00:00Z',
  }),
  g(13, 'Graphing calculator', 'electronics', 'Calculator', 30, 8, 'holding', '2026-10-04T17:00:00Z', {
    serialNumber: 'TI-5521-88',
    holdUntil: '2026-11-03T07:00:00Z',
  }),
  g(14, 'Office chair', 'furniture', 'Armchair', 20, 5, 'intake', '2026-10-07T17:00:00Z'),
  g(15, 'Rice cooker', 'kitchen', 'CookingPot', 10, 2, 'intake', '2026-10-07T17:00:00Z'),
  g(
    16,
    'Mirror, full length',
    'dorm_essentials',
    'RectangleVertical',
    8,
    1,
    'intake',
    '2026-10-08T17:00:00Z',
  ),
  g(17, 'Textbook bundle, chemistry', 'textbooks', 'BookOpen', 20, 0, 'intake', '2026-10-08T17:00:00Z'),
  g(18, 'Dining chairs, set of 2', 'furniture', 'Armchair', 25, 6, 'sold', '2026-08-28T17:00:00Z'),
  g(19, 'Air fryer', 'kitchen', 'Soup', 20, 5, 'sold', '2026-08-29T17:00:00Z'),
  g(20, 'Longboard', 'bikes_boards', 'Disc3', 30, 8, 'sold', '2026-08-30T17:00:00Z'),
  g(21, 'Rain jacket', 'clothing', 'Umbrella', 8, 0, 'sold', '2026-08-31T17:00:00Z'),
  g(22, 'Keyboard', 'electronics', 'Keyboard', 6, 1, 'sold', '2026-09-01T17:00:00Z'),
  g(23, 'Mattress topper', 'other', 'Layers', 0, 0, 'disposed', '2026-08-27T17:00:00Z'),
  g(24, 'Broken desk lamp', 'dorm_essentials', 'LampDesk', 0, 0, 'disposed', '2026-08-27T17:00:00Z'),
  g(25, 'Cracked monitor', 'electronics', 'Monitor', 0, 0, 'disposed', '2026-08-29T17:00:00Z'),
];

/** The hold-until date the intake action returns for new items, as the backend would set it. */
export const INTAKE_HOLD_UNTIL = '2026-11-07T07:00:00Z';
