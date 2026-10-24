// Types owned by lib/pricing. The Live queries map these onto the return types in lib/types.ts
// If lib/types.ts already has a price table type, merge these fields into it and import it here instead of PriceRow

export type TierKey = 'early' | 'standard' | 'final';

export type RegistrationTier = {
  key: TierKey;
  label: string;
  cents: number;
  endsAt: string; // ISO timestamp with Pacific offset
};

export type AddOn = {
  key: string;
  label: string;
  cents: number;
  note: string;
  coveragePerItemCents?: number;
  orderCapCents?: number;
  windowHours?: number;
  maxPerDay?: number;
  radiusMiles?: number;
};

export type PriceRow = {
  campusId: string;
  _todo?: string;
  startsAt: string;
  endsAt: string;
  itemStandardCents: number;
  itemLargeCents: number;
  standardBoxRule: { maxInches: [number, number, number]; maxPounds: number };
  registrationTiers: RegistrationTier[];
  cancelWindowDays: number;
  balanceDueDate: string;
  pickupWindow: { startsAt: string; endsAt: string };
  fullService: { cents: number; maxItems: number };
  addOns: AddOn[];
  fees: {
    overweightCents: number;
    repackCents: number;
    changeOrNoShowCents: number;
    changeWindowHours: number;
    offCampusPickupCents: number;
  };
  coveragePerItemCents: number;
  marketplace: { buyerPct: number; buyerFlatCents: number; sellerPct: number };
  salesTaxBps: number;
};

export type Line = { key: string; label: string; cents: number };

export type CheckoutLines = {
  itemCents: number;
  buyerFeeCents: number;
  taxCents: number;
  totalCents: number;
  lines: Line[]; // item, buyer fee, tax, in that order
};

export type SummerHoldInput = {
  standardCount: number;
  largeCount: number;
  addOnKeys: string[];
  offCampus: boolean;
  fullService: boolean;
};

export type SummerHoldLines = {
  tierKey: TierKey;
  lines: Line[]; // no tax line, ever
  totalCents: number;
};

export type Offer = {
  key: string; // "full_service" or an add-on key
  label: string;
  cents: number;
  note?: string;
  selected: false;
};

// Thrown by the pure functions; the Live queries turn it into fail(code, message).
export class PricingError extends Error {
  constructor(
    public code: 'VALIDATION' | 'DEADLINE_PASSED',
    message: string,
  ) {
    super(message);
    this.name = 'PricingError';
  }
}
