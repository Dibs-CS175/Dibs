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
