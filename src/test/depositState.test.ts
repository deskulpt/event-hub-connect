import { describe, expect, it } from "vitest";
import { getDepositState } from "@/services/bookings";

describe("getDepositState", () => {
  it("returns none when deposit is zero", () => {
    expect(getDepositState({ deposit_cents: 0, status: "pending" })).toBe("none");
  });

  it("returns unpaid for pending or cancelled with deposit", () => {
    expect(getDepositState({ deposit_cents: 5000, status: "pending" })).toBe("unpaid");
    expect(getDepositState({ deposit_cents: 5000, status: "cancelled" })).toBe("unpaid");
  });

  it("returns paid for confirmed lifecycle", () => {
    expect(getDepositState({ deposit_cents: 5000, status: "confirmed" })).toBe("paid");
    expect(getDepositState({ deposit_cents: 5000, status: "in_progress" })).toBe("paid");
    expect(getDepositState({ deposit_cents: 5000, status: "completed" })).toBe("paid");
  });

  it("returns refunded when booking refunded", () => {
    expect(getDepositState({ deposit_cents: 5000, status: "refunded" })).toBe("refunded");
  });
});
