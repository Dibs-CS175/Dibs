import {
  PricingError,
  type Line,
  type Offer,
  type PriceRow,
  type SummerHoldInput,
  type SummerHoldLines,
} from './types';
import { currentTier } from './tiers';

const isCount = (n: number) => Number.isInteger(n) && n >= 0;

// Summer Hold quote at asOf. Summer Hold never gets a tax line
export function summerHoldLines(row: PriceRow, input: SummerHoldInput, asOf: Date): SummerHoldLines {
  const tier = currentTier(row, asOf);
  if (!tier) throw new PricingError('DEADLINE_PASSED', 'Summer Hold registration has closed');

  const { standardCount, largeCount } = input;
  if (!isCount(standardCount) || !isCount(largeCount)) {
    throw new PricingError('VALIDATION', 'Item counts must be whole numbers, 0 or more');
  }
  if (standardCount + largeCount === 0) {
    throw new PricingError('VALIDATION', 'Add at least one item');
  }

  // Waiting on Kyan: does $449 replace item prices for up to 7 items, does registration still apply,
  // what does item 8+ cost, can it combine with priority or delivery
  if (input.fullService) {
    throw new PricingError('VALIDATION', 'Full Service rules not decided');
  }

  const lines: Line[] = [
    {
      key: 'standard_items',
      label: `Standard items × ${standardCount}`,
      cents: standardCount * row.itemStandardCents,
    },
    { key: 'large_items', label: `Large items × ${largeCount}`, cents: largeCount * row.itemLargeCents },
    { key: 'registration', label: tier.label, cents: tier.cents },
  ];

  for (const key of input.addOnKeys) {
    const addOn = row.addOns.find((a) => a.key === key);
    if (!addOn) throw new PricingError('VALIDATION', `Unknown add-on: ${key}`);
    lines.push({ key: addOn.key, label: addOn.label, cents: addOn.cents });
  }

  if (input.offCampus) {
    lines.push({ key: 'off_campus', label: 'Off-campus pickup', cents: row.fees.offCampusPickupCents });
  }

  // Skip 0 lines (no large items, a free tier) so the quote only lists what the student pays for
  const paid = lines.filter((l) => l.cents !== 0);
  return {
    tierKey: tier.key,
    lines: paid,
    totalCents: paid.reduce((sum, l) => sum + l.cents, 0),
  };
}

// The "4 items from $X" all-in teaser at asOf, or null once registration has closed
// Uses the current tier on purpose: a fixed "from $221" after April 15 advertises a price nobody can get
export function summerHoldTeaser(row: PriceRow, asOf: Date): number | null {
  const tier = currentTier(row, asOf);
  if (!tier) return null;
  return 4 * row.itemStandardCents + tier.cents;
}

// Full Service plus every add-on, none selected
export function summerHoldOffers(row: PriceRow): Offer[] {
  return [
    { key: 'full_service', label: 'Full Service', cents: row.fullService.cents, selected: false },
    ...row.addOns.map(
      (a): Offer => ({ key: a.key, label: a.label, cents: a.cents, note: a.note, selected: false }),
    ),
  ];
}
