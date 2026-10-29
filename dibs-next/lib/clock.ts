// Set DIBS_AS_OF to an ISO timestamp with an offset, like 2027-04-01T12:00:00-07:00,
// to pin the date for the December demo and for manual checks (D7, B2, B8).
export function now(): Date {
  const pinned = process.env.DIBS_AS_OF;
  if (!pinned) return new Date();
  const d = new Date(pinned);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`DIBS_AS_OF is not a valid date: ${pinned}`);
  }
  return d;
}