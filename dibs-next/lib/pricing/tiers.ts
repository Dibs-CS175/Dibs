import type { PriceRow, RegistrationTier } from './types';


 // The registration tier in effect at asOf, or null once the final tier has ended
 // asOf is passed in; this file never reads the clock
 
export function currentTier(row: PriceRow, asOf: Date): RegistrationTier | null {
  // Tiers are listed in order (early, standard, final); the first one not yet ended is in effect
  // Compare numbers from Date.parse, never the ISO strings: their offsets make string order unreliable
  const t = asOf.getTime();
  return row.registrationTiers.find((tier) => t <= Date.parse(tier.endsAt)) ?? null;
}
