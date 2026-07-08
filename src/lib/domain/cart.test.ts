import { describe, expect, it } from "vitest";
import { getBundle } from "./bundle";
import {
  buildCartLines,
  computeTotals,
  countSelectedByCategory,
  financingPerMonthCents,
  groupCartLines,
  productQuantity,
} from "./cart";
import { lineKey, seedSelection, type Quantities } from "./selection";

const bundle = getBundle();
const seed = seedSelection(bundle).quantities;
const productById = (id: string) => {
  const p = bundle.products.find((x) => x.id === id);
  if (!p) throw new Error(`missing product ${id}`);
  return p;
};

describe("buildCartLines", () => {
  it("emits one line per selected product/variant, in catalog order", () => {
    const lines = buildCartLines(bundle, seed);
    expect(lines.map((l) => l.key)).toEqual([
      "cam-v4::white",
      "cam-pan-v3::white",
      "cam-unlimited",
      "sense-motion-sensor",
      "sense-hub",
      "microsd-card-256gb",
    ]);
  });

  it("carries the free + required flags for Sense Hub", () => {
    const hub = buildCartLines(bundle, seed).find(
      (l) => l.productId === "sense-hub",
    );
    expect(hub?.unitActive).toBe(0);
    expect(hub?.unitCompare).toBe(29.92);
    expect(hub?.required).toBe(true);
  });

  it("omits lines with zero quantity", () => {
    const lines = buildCartLines(bundle, seed);
    expect(lines.some((l) => l.productId === "duo-cam-doorbell")).toBe(false);
  });
});

describe("per-variant quantities are tracked separately", () => {
  it("shows two variants of one product as two independent lines", () => {
    const quantities: Quantities = { "cam-v4::white": 2, "cam-v4::black": 3 };
    const camV4Lines = buildCartLines(bundle, quantities).filter(
      (l) => l.productId === "cam-v4",
    );
    expect(camV4Lines).toHaveLength(2);
    expect(camV4Lines.find((l) => l.variantId === "white")?.qty).toBe(2);
    expect(camV4Lines.find((l) => l.variantId === "black")?.qty).toBe(3);
  });

  it("sums variant quantities for productQuantity", () => {
    const quantities: Quantities = { "cam-v4::white": 2, "cam-v4::black": 3 };
    expect(productQuantity(productById("cam-v4"), quantities)).toBe(5);
  });
});

describe("computeTotals (card-canonical, honest math — DESIGN-SPEC §9)", () => {
  it("computes the seeded active, compare, and savings totals", () => {
    const totals = computeTotals(buildCartLines(bundle, seed));
    expect(totals.activeCents).toBe(20987); // $209.87
    expect(totals.compareCents).toBe(26079); // $260.79
    expect(totals.savingsCents).toBe(5092); // $50.92 (matches the mock)
  });

  it("adds no savings for an undiscounted line", () => {
    const quantities: Quantities = { [lineKey("microsd-card-256gb")]: 1 };
    const totals = computeTotals(buildCartLines(bundle, quantities));
    expect(totals.savingsCents).toBe(0);
    expect(totals.activeCents).toBe(2098);
  });
});

describe("countSelectedByCategory", () => {
  it('matches the design\'s "N selected" per step', () => {
    expect(countSelectedByCategory(bundle, seed)).toEqual({
      cameras: 2,
      plan: 1,
      sensors: 2,
      accessories: 1,
    });
  });

  it("counts a product once no matter how many variants are selected", () => {
    const quantities: Quantities = { "cam-v4::white": 1, "cam-v4::black": 4 };
    expect(countSelectedByCategory(bundle, quantities).cameras).toBe(1);
  });
});

describe("groupCartLines", () => {
  it("orders groups Cameras · Sensors · Accessories · Plan", () => {
    const groups = groupCartLines(bundle, buildCartLines(bundle, seed));
    expect(groups.map((g) => g.category.id)).toEqual([
      "cameras",
      "sensors",
      "accessories",
      "plan",
    ]);
  });
});

describe("financingPerMonthCents", () => {
  it("spreads the active total across the term", () => {
    expect(financingPerMonthCents(20987, 12)).toBe(1749); // $17.49/mo
    expect(financingPerMonthCents(1200, 12)).toBe(100);
  });

  it("guards against a non-positive term", () => {
    expect(financingPerMonthCents(20987, 0)).toBe(20987);
  });
});
