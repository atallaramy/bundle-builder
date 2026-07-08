import type { BundleData } from "./types";

/**
 * The shopper's raw choices — the single serializable source of truth the store
 * holds and persistence saves. Everything shown (lines, counts, totals) is
 * derived from this + the catalog; nothing derived is stored.
 */
export interface Selection {
  /** composite line key (see `lineKey`) -> quantity */
  quantities: Record<string, number>;
  /** productId -> currently active variant id (drives the card's stepper) */
  activeVariant: Record<string, string>;
}

/** Stable key for a (product, variant) line. Unvariated products key by id. */
export function lineKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}::${variantId}` : productId;
}

/**
 * Build the initial selection from the catalog seed, so the app loads looking
 * exactly like the design. The active variant defaults to the seeded variant
 * (so its card stepper shows the seeded qty), else the first variant.
 */
export function seedSelection(bundle: BundleData): Selection {
  const quantities: Record<string, number> = {};
  const activeVariant: Record<string, string> = {};

  for (const p of bundle.products) {
    if (p.variants && p.variants.length > 0) {
      for (const v of p.variants) {
        if (v.seededQuantity && v.seededQuantity > 0) {
          quantities[lineKey(p.id, v.id)] = v.seededQuantity;
        }
      }
      const seeded = p.variants.find(
        (v) => v.seededQuantity && v.seededQuantity > 0,
      );
      activeVariant[p.id] = (seeded ?? p.variants[0]).id;
    } else if (p.seededQuantity && p.seededQuantity > 0) {
      quantities[lineKey(p.id)] = p.seededQuantity;
    }
  }

  return { quantities, activeVariant };
}
