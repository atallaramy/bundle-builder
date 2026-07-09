/**
 * Catalog types — the typed contract for `src/data/bundle.json`.
 *
 * The app is data-driven (BRIEF "Data"): components render from these shapes,
 * never from hardcoded per-product markup. Prices are plain numbers in dollars;
 * an `active` price of 0 renders as "FREE" (derived, not flagged).
 */

export type CategoryId = "cameras" | "plan" | "sensors" | "accessories";

/** Named icons drawn as inline SVG by the UI (kept out of the data as markup).
 *  `plan-logo` (the blue Wyze plan lockup) is a product icon only, never a
 *  category/step-header icon — the bundle validator keeps step icons to the
 *  four header glyphs. */
export type IconName = "camera" | "shield" | "sensor" | "grid" | "plan-logo";

/** A category = one accordion step + one review-panel group. Step order and
 *  review order differ (Plan is step 2 but listed last in the review). */
export interface Category {
  id: CategoryId;
  step: number; // accordion position, 1..4
  stepTitle: string; // e.g. "Choose your cameras"
  reviewLabel: string; // e.g. "Cameras"
  reviewOrder: number; // ordering within the review panel
  icon: IconName;
}

export interface Price {
  active: number; // dollars; 0 => "FREE"
  compareAt?: number; // struck-through compare-at, when discounted
  unit?: "mo"; // renders a "/mo" suffix (the plan)
}

/** A selectable colour/option. Each variant tracks its own quantity. */
export interface Variant {
  id: string; // stable key, e.g. "white"
  label: string; // e.g. "White"
  thumb: string; // chip thumbnail (public path)
  image?: string; // hero override shown when this variant is active
  seededQuantity?: number; // initial qty so load matches the design
}

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  description?: string; // rendered only when present (cameras have it; others don't)
  discountBadge?: string; // purple pill, e.g. "Save 22%"
  learnMore?: boolean; // show the "Learn More" link
  image?: string; // default hero; absent for the plan (uses `icon`)
  icon?: IconName; // e.g. the plan's shield when there is no product image
  imageFit?: "cover" | "contain"; // review-tile fit; Pan v3 crops (Figma FILL), others contain
  framedThumb?: boolean; // Cam v4 swatch = rounded product-frame thumb (cr5); others flat rects (cr0)
  price: Price;
  variants?: Variant[]; // absent => single, unvariated product (e.g. doorbell)
  seededQuantity?: number; // initial qty for unvariated products
  required?: boolean; // Sense Hub: locked at 1, stepper disabled
  hasStepper?: boolean; // defaults true; false for the plan (no add-control)
}

/** Static, data-driven copy for the review panel's non-line-item rows. */
export interface PanelConfig {
  shipping: { label: string; compareAt: number }; // renders "~~$5.99~~ FREE"
  guarantee: { image: string; text: string };
  financing: { months: number }; // "as low as $(total / months)/mo"
}

export interface BundleData {
  categories: Category[];
  products: Product[];
  panel: PanelConfig;
}
