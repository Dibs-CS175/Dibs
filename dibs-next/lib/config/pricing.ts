// Every business money value for Dibs lives here, in integer cents.
// The UI never reads these directly: quote functions in lib/queries/pricing.ts put them into quote lines.

/** Dibs Protect fee added to a marketplace checkout. */
export const DIBS_PROTECT_FEE_CENTS = 0; // TODO: set from team research

/** Summer Hold price per standard item (fits in a bin). */
export const SUMMER_HOLD_STANDARD_ITEM_CENTS = 0; // TODO: set from team research

/** Summer Hold price per large item (furniture, bikes). */
export const SUMMER_HOLD_LARGE_ITEM_CENTS = 0; // TODO: set from team research

/** Deposit taken when a Summer Hold booking is confirmed. */
export const SUMMER_HOLD_DEPOSIT_CENTS = 0; // TODO: set from team research

/** Extra charge for pickup from an off-campus address. */
export const SUMMER_HOLD_OFF_CAMPUS_SURCHARGE_CENTS = 0; // TODO: set from team research

/** Charge for returning items to a different address than pickup. */
export const SUMMER_HOLD_RETURN_SURCHARGE_CENTS = 0; // TODO: set from team research

/* ---------- Consignment (Summer Hold "sell" items) ---------- */
// Set by team decision on 2026-10-09: Dibs keeps 60% of the sale price, the student gets 40%.
// The buyer pays the Dibs Protect fee on top, so it never comes out of the student's share.

/** Dibs' commission on a consigned sale, in basis points of the sale price. 6000 = 60%. */
export const CONSIGNMENT_COMMISSION_BPS = 6000;

/** The student's share of a consigned sale. Derived here so no other file does the arithmetic. */
export const CONSIGNMENT_OWNER_SHARE_BPS = 10000 - CONSIGNMENT_COMMISSION_BPS;

/** Lowest asking price Dibs accepts for consignment. Cheaper items go back to the student or to Goods. */
export const CONSIGNMENT_MIN_ASKING_PRICE_CENTS = 3000;
