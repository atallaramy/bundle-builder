/**
 * Loads and validates the seed catalog (`src/data/bundle.json`).
 *
 * The JSON is a static import, so it's typed at build time — but we still
 * validate its shape at runtime and throw loudly on any malformation. That
 * turns a data typo into an immediate, explanatory boot error instead of a
 * silent mis-render downstream (CLAUDE.md: fail loud, no silent failures). The
 * validation is hand-written to keep the domain layer dependency-free.
 */
import rawBundle from "@/data/bundle.json";
import type {
  BundleData,
  Category,
  CategoryId,
  IconName,
  PanelConfig,
  Price,
  Product,
  Variant,
} from "./types";

const CATEGORY_IDS: readonly CategoryId[] = [
  "cameras",
  "plan",
  "sensors",
  "accessories",
];
const ICON_NAMES: readonly IconName[] = ["camera", "shield", "sensor", "grid"];

export class BundleValidationError extends Error {
  constructor(issues: string[]) {
    super(`Invalid bundle.json:\n - ${issues.join("\n - ")}`);
    this.name = "BundleValidationError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonNegInt(value: unknown): value is number {
  return isFiniteNumber(value) && Number.isInteger(value) && value >= 0;
}

/**
 * Validate the raw catalog and return it typed. Exported so the API route can
 * revalidate any payload it serves, and so it can be unit-tested directly.
 */
export function parseBundle(raw: unknown): BundleData {
  const issues: string[] = [];

  if (!isRecord(raw)) {
    throw new BundleValidationError(["root is not an object"]);
  }

  // ---- categories ----
  const categories: Category[] = [];
  if (!Array.isArray(raw.categories)) {
    issues.push("`categories` must be an array");
  } else {
    raw.categories.forEach((c, i) => {
      const at = `categories[${i}]`;
      if (!isRecord(c)) return issues.push(`${at} is not an object`);
      if (!CATEGORY_IDS.includes(c.id as CategoryId))
        issues.push(`${at}.id "${String(c.id)}" is not a known category`);
      if (!isNonNegInt(c.step)) issues.push(`${at}.step must be an integer`);
      if (typeof c.stepTitle !== "string")
        issues.push(`${at}.stepTitle must be a string`);
      if (typeof c.reviewLabel !== "string")
        issues.push(`${at}.reviewLabel must be a string`);
      if (!isNonNegInt(c.reviewOrder))
        issues.push(`${at}.reviewOrder must be an integer`);
      if (!ICON_NAMES.includes(c.icon as IconName))
        issues.push(`${at}.icon "${String(c.icon)}" is not a known icon`);
      if (issues.length === 0) categories.push(c as unknown as Category);
    });
  }

  // ---- products ----
  const products: Product[] = [];
  if (!Array.isArray(raw.products)) {
    issues.push("`products` must be an array");
  } else {
    raw.products.forEach((p, i) => {
      const at = `products[${i}]`;
      if (!isRecord(p)) return issues.push(`${at} is not an object`);
      if (typeof p.id !== "string") issues.push(`${at}.id must be a string`);
      if (typeof p.name !== "string")
        issues.push(`${at}.name must be a string`);
      if (!CATEGORY_IDS.includes(p.category as CategoryId))
        issues.push(`${at}.category "${String(p.category)}" is unknown`);

      // price
      if (!isRecord(p.price)) {
        issues.push(`${at}.price must be an object`);
      } else {
        if (!isFiniteNumber(p.price.active) || p.price.active < 0)
          issues.push(`${at}.price.active must be a number >= 0`);
        if (
          p.price.compareAt !== undefined &&
          (!isFiniteNumber(p.price.compareAt) || p.price.compareAt < 0)
        )
          issues.push(`${at}.price.compareAt must be a number >= 0`);
        if (p.price.unit !== undefined && p.price.unit !== "mo")
          issues.push(`${at}.price.unit must be "mo" when present`);
      }

      // variants
      if (p.variants !== undefined) {
        if (!Array.isArray(p.variants)) {
          issues.push(`${at}.variants must be an array when present`);
        } else {
          p.variants.forEach((v, j) => {
            const vat = `${at}.variants[${j}]`;
            if (!isRecord(v)) return issues.push(`${vat} is not an object`);
            if (typeof v.id !== "string")
              issues.push(`${vat}.id must be a string`);
            if (typeof v.label !== "string")
              issues.push(`${vat}.label must be a string`);
            if (typeof v.thumb !== "string")
              issues.push(`${vat}.thumb must be a string`);
            if (
              v.seededQuantity !== undefined &&
              !isNonNegInt(v.seededQuantity)
            )
              issues.push(
                `${vat}.seededQuantity must be a non-negative integer`,
              );
          });
        }
      }

      if (p.seededQuantity !== undefined && !isNonNegInt(p.seededQuantity))
        issues.push(`${at}.seededQuantity must be a non-negative integer`);

      if (issues.length === 0) products.push(p as unknown as Product);
    });
  }

  // ---- cross-checks ----
  if (issues.length === 0) {
    const categoryIds = new Set(categories.map((c) => c.id));
    for (const p of products) {
      if (!categoryIds.has(p.category))
        issues.push(
          `product "${p.id}" references missing category "${p.category}"`,
        );
    }
    const steps = categories.map((c) => c.step).sort((a, b) => a - b);
    if (steps.join(",") !== "1,2,3,4")
      issues.push(
        `categories must cover steps 1..4 exactly (got ${steps.join(",")})`,
      );
  }

  // ---- panel ----
  if (!isRecord(raw.panel)) {
    issues.push("`panel` must be an object");
  } else {
    const panel = raw.panel;
    if (!isRecord(panel.shipping) || typeof panel.shipping.label !== "string")
      issues.push("`panel.shipping.label` must be a string");
    if (!isRecord(panel.shipping) || !isFiniteNumber(panel.shipping.compareAt))
      issues.push("`panel.shipping.compareAt` must be a number");
    if (!isRecord(panel.guarantee) || typeof panel.guarantee.text !== "string")
      issues.push("`panel.guarantee.text` must be a string");
    if (!isRecord(panel.financing) || !isNonNegInt(panel.financing.months))
      issues.push("`panel.financing.months` must be a positive integer");
  }

  if (issues.length > 0) throw new BundleValidationError(issues);

  return {
    categories,
    products,
    panel: raw.panel as PanelConfig,
  };
}

// Validate once at module load — a malformed catalog fails at boot, not later.
const bundle: BundleData = parseBundle(rawBundle);

/** The validated seed catalog. */
export function getBundle(): BundleData {
  return bundle;
}

export type { BundleData, Category, Product, Variant, Price, PanelConfig };
