import { describe, expect, it } from "vitest";
import { splitBookingTotal } from "./platform-fee";

describe("splitBookingTotal", () => {
  it("takes a 10% platform fee", () => {
    expect(splitBookingTotal(150000)).toEqual({ totalCents: 150000, feeCents: 15000, payoutCents: 135000 });
  });
  it("rounds the fee to whole cents and keeps the split exact", () => {
    const s = splitBookingTotal(999);
    expect(s.feeCents).toBe(100);
    expect(s.payoutCents).toBe(899);
  });
  it("never goes negative", () => {
    expect(splitBookingTotal(-500).feeCents).toBe(0);
  });
});
