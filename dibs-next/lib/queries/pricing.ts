import { simulate } from '@/lib/dev';
import {
  DIBS_PROTECT_FEE_CENTS,
  SUMMER_HOLD_DEPOSIT_CENTS,
  SUMMER_HOLD_LARGE_ITEM_CENTS,
  SUMMER_HOLD_OFF_CAMPUS_SURCHARGE_CENTS,
  SUMMER_HOLD_STANDARD_ITEM_CENTS,
} from '@/lib/config/pricing';
import { listings } from '@/lib/fixtures/listings';
import type { Result } from '@/lib/result';
import type { HousingType, Quote, StorageItemInput } from '@/lib/types';

/**
 * Checkout quote for Hold to Dibs. Lines use the pricing placeholders.
 * The real backend computes `totalCents`; the stub returns the asking price because every fee placeholder is 0.
 */
export async function getCheckoutQuote(listingId: string): Promise<Result<Quote>> {
  // STUB(pricing): replace with real implementation
  const l = listings.find((x) => x.id === listingId) ?? listings[1]!;
  return simulate<Quote>({
    lines: [
      { label: 'Item', cents: l.priceCents },
      { label: 'Dibs Protect fee', cents: DIBS_PROTECT_FEE_CENTS },
    ],
    totalCents: l.priceCents,
  });
}

/**
 * Summer Hold quote. One line per item from the placeholders, plus surcharge and deposit lines.
 * The real backend computes `totalCents`; the stub returns 0 because every placeholder is 0.
 */
export async function getSummerHoldQuote(
  items: StorageItemInput[],
  housingType: HousingType,
): Promise<Result<Quote>> {
  // STUB(pricing): replace with real implementation
  return simulate<Quote>({
    lines: [
      ...items.map((i) => ({
        label: `${i.label || 'Item'} (${i.size}${i.disposition === 'sell' ? ', to sell' : ''})`,
        cents: i.size === 'large' ? SUMMER_HOLD_LARGE_ITEM_CENTS : SUMMER_HOLD_STANDARD_ITEM_CENTS,
      })),
      ...(housingType === 'off_campus'
        ? [{ label: 'Off-campus pickup', cents: SUMMER_HOLD_OFF_CAMPUS_SURCHARGE_CENTS }]
        : []),
      { label: 'Deposit due today', cents: SUMMER_HOLD_DEPOSIT_CENTS },
    ],
    totalCents: 0,
  });
}
