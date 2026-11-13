/** Platform commission taken on every paid booking (10%). */
export const PLATFORM_FEE_RATE = 0.1;

export interface FeeSplit {
  totalCents: number;
  feeCents: number;
  payoutCents: number;
}

/** Split a booking total (in cents) into the platform fee and the provider payout. */
export const splitBookingTotal = (totalCents: number): FeeSplit => {
  const total = Math.max(0, Math.round(totalCents));
  const feeCents = Math.round(total * PLATFORM_FEE_RATE);
  return { totalCents: total, feeCents, payoutCents: total - feeCents };
};
