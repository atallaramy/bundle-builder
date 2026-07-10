import { create } from "zustand";
import { apiBundleSource, type BundleSource } from "@/lib/data/bundle-source";
import { getBundle } from "@/lib/domain/bundle";
import {
  lineKey,
  normalizeSelection,
  quantityOf,
  seedSelection,
  type Selection,
} from "@/lib/domain/selection";
import type { BundleData } from "@/lib/domain/types";
import {
  localStoragePersistence,
  type SelectionPersistence,
} from "@/lib/persistence/selection-persistence";

/**
 * The single source of truth. Holds only the raw `Selection` (+ UI open-step and
 * a save timestamp); every count/total/line shown is derived from this via the
 * pure domain functions (see `store/hooks`). Nothing derived is stored.
 */
export interface BundleState {
  /** The catalog the UI renders from. Seeded synchronously from the bundled JSON
   *  (instant, flash-free first paint), then revalidated from the data source on
   *  mount — see `loadCatalog`. */
  bundle: BundleData;
  /** Provenance of the current `bundle`: the bundled seed, a live fetch, or a
   *  failed fetch that fell back to the seed. */
  catalogStatus: "seed" | "live" | "error";
  selection: Selection;
  openStep: number | null;
  savedAt: number | null;

  // Actions are function-typed properties (not method signatures) so consumers
  // select them as plain functions — `s.increment` is a value, not an unbound
  // method — which matches how a Zustand store is actually shaped.
  setQuantity: (
    productId: string,
    variantId: string | undefined,
    qty: number,
  ) => void;
  increment: (productId: string, variantId?: string) => void;
  decrement: (productId: string, variantId?: string) => void;
  setActiveVariant: (productId: string, variantId: string) => void;
  setOpenStep: (step: number | null) => void;
  /** Persist the current selection ("Save my system for later"). Returns
   *  whether the write succeeded, so the UI can distinguish a real save. */
  save: () => boolean;
  /** Restore a previously saved selection, if any (called on mount). */
  restore: () => void;
  /** Revalidate the catalog from the data source (stale-while-revalidate). The
   *  seed is already on screen, so this swaps in fresh data without blocking the
   *  first paint, and re-clamps the selection to the fresh catalog. Falls back to
   *  the seed (and fails loud in dev) on any error. Called on mount. */
  loadCatalog: () => Promise<void>;
  /** Return to the seeded configuration. */
  reset: () => void;
}

export interface BundleStoreDeps {
  bundle?: BundleData;
  bundleSource?: BundleSource;
  persistence?: SelectionPersistence;
  now?: () => number;
}

/**
 * Factory so tests (and any future SSR-per-request need) can inject a fresh
 * bundle / persistence / clock. The app uses the default singleton below.
 */
export function createBundleStore(deps: BundleStoreDeps = {}) {
  const seed = deps.bundle ?? getBundle();
  const bundleSource = deps.bundleSource ?? apiBundleSource;
  const persistence = deps.persistence ?? localStoragePersistence;
  const now = deps.now ?? (() => Date.now());

  return create<BundleState>((set, get) => ({
    bundle: seed,
    catalogStatus: "seed",
    selection: seedSelection(seed),
    openStep: 1, // Step 1 (Cameras) open on load.
    savedAt: null,

    setQuantity(productId, variantId, qty) {
      const key = lineKey(productId, variantId);
      // Guard the public action against non-finite input (NaN/Infinity), which
      // would slip past the `next === 0` check and poison derived totals.
      const next = Number.isFinite(qty) ? Math.max(0, Math.floor(qty)) : 0;
      set((state) => {
        const quantities = { ...state.selection.quantities };
        // Keep only positive entries so the map stays the true selection set.
        if (next === 0) delete quantities[key];
        else quantities[key] = next;
        return { selection: { ...state.selection, quantities } };
      });
    },

    increment(productId, variantId) {
      const current = quantityOf(
        get().selection.quantities,
        productId,
        variantId,
      );
      get().setQuantity(productId, variantId, current + 1);
    },

    decrement(productId, variantId) {
      const current = quantityOf(
        get().selection.quantities,
        productId,
        variantId,
      );
      get().setQuantity(productId, variantId, current - 1);
    },

    setActiveVariant(productId, variantId) {
      set((state) => ({
        selection: {
          ...state.selection,
          activeVariant: {
            ...state.selection.activeVariant,
            [productId]: variantId,
          },
        },
      }));
    },

    setOpenStep(step) {
      set({ openStep: step });
    },

    save() {
      const ok = persistence.save(get().selection);
      // Only report a save if it actually landed — no false "Saved" on a
      // swallowed storage error (quota/private mode).
      if (ok) set({ savedAt: now() });
      return ok;
    },

    restore() {
      const restored = persistence.load();
      // Repair the untrusted payload against catalog invariants before trusting
      // it (valid active variant per product, required items re-clamped).
      if (restored)
        set((state) => ({
          selection: normalizeSelection(state.bundle, restored),
        }));
    },

    async loadCatalog() {
      try {
        const fresh = await bundleSource.load();
        set((state) => ({
          bundle: fresh,
          catalogStatus: "live",
          // Re-clamp the selection to the fresh catalog so a product/variant that
          // changed or vanished server-side can't linger in the selection.
          selection: normalizeSelection(fresh, state.selection),
        }));
      } catch (err) {
        // Keep the seed on screen — the app stays fully usable — but surface the
        // failure loudly in dev rather than swallowing it (CLAUDE.md: fail loud).
        if (process.env.NODE_ENV !== "production") {
          console.error(
            "Catalog revalidation from the data source failed; keeping the bundled seed.",
            err,
          );
        }
        set({ catalogStatus: "error" });
      }
    },

    reset() {
      persistence.clear();
      set((state) => ({
        selection: seedSelection(state.bundle),
        openStep: 1,
        savedAt: null,
      }));
    },
  }));
}

export const useBundleStore = createBundleStore();
