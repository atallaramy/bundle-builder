import { describe, expect, it } from "vitest";
import { formatCents, formatUSD, fromCents, toCents } from "./money";

describe("money", () => {
  it("converts dollars to integer cents, rounding half up", () => {
    expect(toCents(27.98)).toBe(2798);
    expect(toCents(0)).toBe(0);
    expect(toCents(89.98)).toBe(8998);
    expect(toCents(9.99)).toBe(999);
  });

  it("avoids floating-point drift when summing in cents", () => {
    // 0.1 + 0.2 === 0.30000000000000004 in float; cents stay exact.
    expect(toCents(0.1) + toCents(0.2)).toBe(30);
  });

  it("round-trips cents back to dollars", () => {
    expect(fromCents(2798)).toBe(27.98);
    expect(fromCents(0)).toBe(0);
  });

  it("formats as USD currency", () => {
    expect(formatCents(20987)).toBe("$209.87");
    expect(formatCents(0)).toBe("$0.00");
    expect(formatUSD(9.99)).toBe("$9.99");
    expect(formatUSD(1234.5)).toBe("$1,234.50");
  });
});
