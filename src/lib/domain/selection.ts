import type { BundleData } from "./types";

/** Quantity by composite line key (see `lineKey`). */
export type Quantities = Record<string, number>;

/**
 * The shopper's raw choices — the single serializable source of truth the store
 * holds and persistence saves. Everything shown (lines, counts, totals) is
 * derived from this + the catalog; nothing derived is stored.
 */
export interface Selection {
  quantities: Quantities;
  /** productId -> currently active variant id (drives the card's stepper) */
  activeVariant: Record<string, string>;
}

/** Stable key for a (product, variant) line. Unvariated products key by id. */
export function lineKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}::${variantId}` : productId;
}

/** Quantity for one line — the single home for this lookup + zero default. */
export function quantityOf(
  quantities: Quantities,
  productId: string,
  variantId?: string,
): number {
  return quantities[lineKey(productId, variantId)] ?? 0;
}

/** The active variant a product defaults to: its seeded variant, else the first. */
function defaultActiveVariant(
  variants: NonNullable<BundleData["products"][number]["variants"]>,
): string {
  const seeded = variants.find((v) => v.seededQuantity && v.seededQuantity > 0);
  return (seeded ?? variants[0]).id;
}

/**
 * Build the initial selection from the catalog seed, so the app loads looking
 * exactly like the design. The active variant defaults to the seeded variant
 * (so its card stepper shows the seeded qty), else the first variant.
 */
export function seedSelection(bundle: BundleData): Selection {
  const quantities: Quantities = {};
  const activeVariant: Record<string, string> = {};

  for (const p of bundle.products) {
    if (p.variants && p.variants.length > 0) {
      for (const v of p.variants) {
        if (v.seededQuantity && v.seededQuantity > 0) {
          quantities[lineKey(p.id, v.id)] = v.seededQuantity;
        }
      }
      activeVariant[p.id] = defaultActiveVariant(p.variants);
    } else if (p.seededQuantity && p.seededQuantity > 0) {
      quantities[lineKey(p.id)] = p.seededQuantity;
    }
  }

  return { quantities, activeVariant };
}

/**
 * Repair a selection (restored from untrusted localStorage, or carried across a
 * catalog revalidation) against the catalog's invariants: drop any line the
 * catalog no longer offers, give every variated product a valid active variant,
 * and re-clamp required products to their locked quantity. `parseSelection` only
 * checks the payload's *shape*; this restores the *semantics*.
 */
export function normalizeSelection(
  bundle: BundleData,
  selection: Selection,
): Selection {
  // Every line the catalog actually offers (unvariated product → its id;
  // variated product → one key per variant). A saved or freshly-fetched catalog
  // may reference lines that no longer exist (catalog drift) — drop those so a
  // removed product/variant can't linger in state, skew totals, or resurface.
  const validKeys = new Set<string>();
  for (const p of bundle.products) {
    if (p.variants && p.variants.length > 0) {
      for (const v of p.variants) validKeys.add(lineKey(p.id, v.id));
    } else {
      validKeys.add(lineKey(p.id));
    }
  }

  const quantities: Quantities = {};
  for (const [key, qty] of Object.entries(selection.quantities)) {
    if (validKeys.has(key)) quantities[key] = qty;
  }
  const activeVariant: Record<string, string> = { ...selection.activeVariant };

  for (const p of bundle.products) {
    if (p.variants && p.variants.length > 0) {
      const current = activeVariant[p.id];
      const valid = p.variants.some((v) => v.id === current);
      if (!valid) activeVariant[p.id] = defaultActiveVariant(p.variants);
    }
    if (p.required) {
      // Required items are locked at their seeded quantity (Sense Hub → 1).
      quantities[lineKey(p.id)] = p.seededQuantity ?? 1;
    }
  }

  return { quantities, activeVariant };
}
