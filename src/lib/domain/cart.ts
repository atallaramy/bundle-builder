import type {
  BundleData,
  Category,
  CategoryId,
  IconName,
  Product,
  Variant,
} from "./types";
import { lineKey, quantityOf, type Quantities } from "./selection";
import { toCents } from "./money";

/** A concrete review-panel line: one product, or one variant of it. */
export interface CartLine {
  key: string;
  productId: string;
  variantId?: string;
  name: string;
  image: string;
  imageFit?: "cover" | "contain"; // review-tile object-fit (Pan v3 crops)
  icon?: IconName; // shown in place of an image when the product has none (plan)
  category: CategoryId;
  unitActive: number; // dollars
  unitCompare?: number; // dollars
  unit?: "mo"; // renders a "/mo" price suffix (the plan)
  qty: number;
  required: boolean;
  hasStepper: boolean;
}

/** Total quantity of a product across its variants (or its own qty). Lines and
 *  counts depend only on quantities — never the active variant — so these take
 *  the quantity map directly. */
export function productQuantity(
  product: Product,
  quantities: Quantities,
): number {
  if (product.variants && product.variants.length > 0) {
    return product.variants.reduce(
      (sum, v) => sum + quantityOf(quantities, product.id, v.id),
      0,
    );
  }
  return quantityOf(quantities, product.id);
}

function imageFor(product: Product, variant?: Variant): string {
  return variant?.image ?? product.image ?? "";
}

/** Derive every review line with qty > 0, in catalog order. */
export function buildCartLines(
  bundle: BundleData,
  quantities: Quantities,
): CartLine[] {
  const lines: CartLine[] = [];

  for (const p of bundle.products) {
    const hasStepper = p.hasStepper !== false;
    const base = {
      name: p.name,
      category: p.category,
      icon: p.icon,
      imageFit: p.imageFit,
      unitActive: p.price.active,
      unitCompare: p.price.compareAt,
      unit: p.price.unit,
      required: p.required === true,
      hasStepper,
    };

    if (p.variants && p.variants.length > 0) {
      for (const v of p.variants) {
        const qty = quantityOf(quantities, p.id, v.id);
        if (qty <= 0) continue;
        lines.push({
          ...base,
          key: lineKey(p.id, v.id),
          productId: p.id,
          variantId: v.id,
          image: imageFor(p, v),
          qty,
        });
      }
    } else {
      const qty = quantityOf(quantities, p.id);
      if (qty <= 0) continue;
      lines.push({
        ...base,
        key: lineKey(p.id),
        productId: p.id,
        image: imageFor(p),
        qty,
      });
    }
  }

  return lines;
}

export interface CartGroup {
  category: Category;
  lines: CartLine[];
}

/** Group lines under their category, ordered for the review panel
 *  (Cameras · Sensors · Accessories · Plan). Empty groups are dropped. */
export function groupCartLines(
  bundle: BundleData,
  lines: CartLine[],
): CartGroup[] {
  const linesByCategory = new Map<CategoryId, CartLine[]>();
  for (const line of lines) {
    const existing = linesByCategory.get(line.category) ?? [];
    existing.push(line);
    linesByCategory.set(line.category, existing);
  }

  return bundle.categories
    .map((category) => ({
      category,
      lines: linesByCategory.get(category.id) ?? [],
    }))
    .filter((group) => group.lines.length > 0)
    .sort((a, b) => a.category.reviewOrder - b.category.reviewOrder);
}

export interface Totals {
  activeCents: number;
  compareCents: number;
  savingsCents: number;
}

/**
 * Grand totals, in cents. Undiscounted lines fall back to their active price on
 * the compare side (so they add no savings). Shipping is not a line, so it's
 * naturally excluded; the plan's price is included (DESIGN-SPEC §9).
 */
export function computeTotals(lines: CartLine[]): Totals {
  let activeCents = 0;
  let compareCents = 0;
  for (const line of lines) {
    activeCents += toCents(line.unitActive) * line.qty;
    compareCents += toCents(line.unitCompare ?? line.unitActive) * line.qty;
  }
  return {
    activeCents,
    compareCents,
    savingsCents: compareCents - activeCents,
  };
}

/** "as low as $X/mo" — the active total spread across N months. */
export function financingPerMonthCents(
  activeCents: number,
  months: number,
): number {
  if (months <= 0) return activeCents;
  return Math.round(activeCents / months);
}

/** Distinct products with qty > 0, per category — the "N selected" counter. */
export function countSelectedByCategory(
  bundle: BundleData,
  quantities: Quantities,
): Record<CategoryId, number> {
  const counts: Record<CategoryId, number> = {
    cameras: 0,
    plan: 0,
    sensors: 0,
    accessories: 0,
  };
  for (const p of bundle.products) {
    if (productQuantity(p, quantities) > 0) counts[p.category] += 1;
  }
  return counts;
}
