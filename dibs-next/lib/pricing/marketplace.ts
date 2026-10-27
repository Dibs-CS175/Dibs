import type { CheckoutLines, PriceRow } from './types';
import { applyBps, pctToBps } from './money';

// Buyer-side quote for a marketplace item
// Fee and tax values come from the row; nothing here is hard-coded
export function checkoutLines(priceCents: number, row: PriceRow): CheckoutLines {
  const { buyerPct, buyerFlatCents } = row.marketplace;
  const buyerFeeCents = applyBps(priceCents, pctToBps(buyerPct)) + buyerFlatCents;
  // Tax applies to the item plus the buyer fee
  const taxCents = applyBps(priceCents + buyerFeeCents, row.salesTaxBps);
  // Sum of the rounded lines, so the total always matches what the buyer sees
  const totalCents = priceCents + buyerFeeCents + taxCents;
  return {
    itemCents: priceCents,
    buyerFeeCents,
    taxCents,
    totalCents,
    lines: [
      { key: 
		'item', 
		label: 'Item', 
		cents: priceCents },
      { key: 'buyer_fee', 
		label: 'Buyer fee', 
		cents: buyerFeeCents },
      { key: 'tax', 
		label: 'Sales tax', 
		cents: taxCents },
    ],
  };
}

// What the seller receives for a marketplace item
export function sellerPayout(priceCents: number, row: PriceRow): number {
  return priceCents - applyBps(priceCents, pctToBps(row.marketplace.sellerPct));
}
