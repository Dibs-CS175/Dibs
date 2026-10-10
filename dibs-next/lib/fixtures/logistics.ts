import type { BinView, RouteStopView, StorageItem } from '@/lib/types';
import { bookings, pickupSlots, returnSlots } from './summerHold';

// Route stops belong to Summer Hold bookings. Three bookings are modeled in full in summerHold.ts;
// the rest exist here only as their stop and items.

const win = (slotId: string) => {
  const s = [...pickupSlots, ...returnSlots].find((x) => x.id === slotId)!;
  return { startsAt: s.startsAt, endsAt: s.endsAt };
};

const items = (bookingId: string, labels: [string, StorageItem['size']][]): StorageItem[] =>
  labels.map(([label, size], i) => ({
    id: `${bookingId}-i${i + 1}`,
    bookingId,
    label,
    size,
    status: 'pending',
    disposition: 'return',
  }));

const stop = (
  id: string,
  slotId: string,
  bookingId: string,
  building: string,
  address: string,
  stopItems: StorageItem[],
  status: RouteStopView['status'] = 'pending',
): RouteStopView => ({
  id,
  slotId,
  bookingId,
  building,
  address,
  itemCount: stopItems.length,
  status,
  items: stopItems,
  window: win(slotId),
});

const bk1Items = bookings[0]!.items;
const bk2Items = bookings[1]!.items;

export const routeStops: RouteStopView[] = [
  stop('st1', 'ps2', 'bk2', 'Hilltop Halls', 'Cedar Building, room 108', bk2Items, 'done'),
  stop(
    'st2',
    'ps2',
    'bk04',
    'Hilltop Halls',
    'Cedar Building, room 215',
    items('bk04', [
      ['Bookshelf', 'large'],
      ['Storage bin', 'standard'],
    ]),
    'done',
  ),
  stop(
    'st3',
    'ps2',
    'bk05',
    'Hilltop Halls',
    'Pine Building, room 102',
    items('bk05', [['Box of kitchenware', 'standard']]),
    'missed',
  ),
  stop('st4', 'ps3', 'bk1', 'Hilltop Halls', 'Pine Building, room 214', bk1Items),
  stop(
    'st5',
    'ps3',
    'bk06',
    'Hilltop Halls',
    'Pine Building, room 301',
    items('bk06', [
      ['Desk chair', 'large'],
      ['Lamp', 'standard'],
      ['Rug, rolled', 'large'],
    ]),
  ),
  stop(
    'st6',
    'ps3',
    'bk07',
    'Orchard Commons',
    'Building 2, room 118',
    items('bk07', [
      ['Storage bin', 'standard'],
      ['Storage bin', 'standard'],
    ]),
  ),
  stop('st7', 'ps3', 'bk08', 'Orchard Commons', 'Building 2, room 204', items('bk08', [['Bike', 'large']])),
  stop(
    'st8',
    'ps5',
    'bk09',
    'North Apartments',
    'Building C, unit 2A',
    items('bk09', [
      ['Dresser', 'large'],
      ['Box of books', 'standard'],
    ]),
  ),
  stop('st9', 'ps5', 'bk10', 'North Apartments', 'Building C, unit 4D', items('bk10', [['Fan', 'standard']])),
  stop(
    'st10',
    'ps5',
    'bk11',
    'North Apartments',
    'Building D, unit 1B',
    items('bk11', [
      ['Desk', 'large'],
      ['Monitor', 'standard'],
    ]),
  ),
  stop(
    'st11',
    'ps6',
    'bk12',
    'Canyon Off-Campus',
    '1840 Arroyo View Dr, apt 12',
    items('bk12', [['Sofa', 'large']]),
  ),
  stop(
    'st12',
    'ps6',
    'bk13',
    'Canyon Off-Campus',
    '1840 Arroyo View Dr, apt 30',
    items('bk13', [
      ['Microwave', 'standard'],
      ['Bin of clothes', 'standard'],
    ]),
  ),
  stop(
    'st13',
    'ps9',
    'bk14',
    'Hilltop Halls',
    'Cedar Building, room 320',
    items('bk14', [['Mirror', 'standard']]),
  ),
  stop(
    'st14',
    'ps9',
    'bk15',
    'Orchard Commons',
    'Building 1, room 107',
    items('bk15', [
      ['Storage bin', 'standard'],
      ['Lamp', 'standard'],
      ['Bike', 'large'],
    ]),
  ),
  // Return stops
  stop(
    'st15',
    'rs2',
    'bk16',
    'Hilltop Halls',
    'Pine Building, room 120',
    items('bk16', [['Desk chair', 'large']]),
  ),
  stop(
    'st16',
    'rs2',
    'bk17',
    'Hilltop Halls',
    'Cedar Building, room 211',
    items('bk17', [
      ['Storage bin', 'standard'],
      ['Fan', 'standard'],
    ]),
  ),
  stop('st17', 'rs3', 'bk2', 'Hilltop Halls', 'Cedar Building, room 108', bk2Items),
  stop(
    'st18',
    'rs3',
    'bk18',
    'North Apartments',
    'Building A, unit 3C',
    items('bk18', [['Bookshelf', 'large']]),
  ),
  stop(
    'st19',
    'rs5',
    'bk19',
    'Orchard Commons',
    'Building 2, room 310',
    items('bk19', [['Box of books', 'standard']]),
  ),
  stop(
    'st20',
    'rs6',
    'bk20',
    'Canyon Off-Campus',
    '2215 Sycamore Ridge Rd, apt 7',
    items('bk20', [['Dining chairs, set of 2', 'large']]),
  ),
];

export const pickupDays = ['2027-06-07', '2027-06-08', '2027-06-09', '2027-06-10', '2027-06-11'];
export const returnDays = ['2027-09-20', '2027-09-21', '2027-09-22'];

const storedItem = (id: string, label: string, binId: string): StorageItem => ({
  id,
  bookingId: 'bk_archive',
  label,
  size: 'standard',
  status: 'stored',
  disposition: 'return',
  binId,
});

const bin = (
  id: string,
  unit: string,
  label: string,
  capacity: number,
  used: number,
  isFull: boolean,
  binItems: StorageItem[] = [],
): BinView => ({
  id,
  unit,
  label,
  capacity,
  used,
  isFull,
  items: binItems,
});

const UNIT_A = 'Arroyo Self Storage, Unit 14';
const UNIT_B = 'Arroyo Self Storage, Unit 22';

export const bins: BinView[] = [
  bin('b1', UNIT_A, 'A-01', 20, 20, true, [
    ...bk2Items,
    storedItem('x1', 'Box of books', 'b1'),
    storedItem('x2', 'Lamp', 'b1'),
  ]),
  bin('b2', UNIT_A, 'A-02', 20, 17, false, [
    storedItem('x3', 'Storage bin', 'b2'),
    storedItem('x4', 'Fan', 'b2'),
  ]),
  bin('b3', UNIT_A, 'A-03', 20, 20, true, [storedItem('x5', 'Mirror', 'b3')]),
  bin('b4', UNIT_A, 'A-04', 20, 9, false, [storedItem('x6', 'Kitchenware', 'b4')]),
  bin('b5', UNIT_A, 'A-05', 12, 4, false),
  bin('b6', UNIT_A, 'A-06', 12, 0, false),
  bin('b7', UNIT_B, 'B-01', 6, 6, true, [storedItem('x7', 'Desk chair', 'b7')]),
  bin('b8', UNIT_B, 'B-02', 6, 3, false, [storedItem('x8', 'Bike', 'b8')]),
  bin('b9', UNIT_B, 'B-03', 6, 1, false),
  bin('b10', UNIT_B, 'B-04', 20, 20, true, [storedItem('x9', 'Bin of clothes', 'b10')]),
  bin('b11', UNIT_B, 'B-05', 20, 11, false),
  bin('b12', UNIT_B, 'B-06', 20, 2, false),
];
