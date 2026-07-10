"use client";

import { useMemo } from "react";
import {
  buildCartLines,
  computeTotals,
  countSelectedByCategory,
  financingPerMonthCents,
  groupCartLines,
  productQuantity,
} from "@/lib/domain/cart";
import { quantityOf } from "@/lib/domain/selection";
import type { Product } from "@/lib/domain/types";
import { useBundleStore } from "./bundle-store";

/**
 * Derived-state hooks. Cart lines/counts depend on the catalog and `quantities`
 * (never the active variant), so hooks subscribe to `s.bundle` +
 * `s.selection.quantities` — switching a colour chip (which changes
 * `activeVariant` but not `quantities`) triggers no recompute or re-render here,
 * while a catalog revalidation (which replaces `s.bundle`) does. Derivation runs
 * once inside `useCartModel`.
 */

/** Everything the review panel needs, derived from the selection in one pass. */
export function useCartModel() {
  const bundle = useBundleStore((s) => s.bundle);
  const quantities = useBundleStore((s) => s.selection.quantities);
  return useMemo(() => {
    const lines = buildCartLines(bundle, quantities);
    const totals = computeTotals(lines);
    return {
      lines,
      groups: groupCartLines(bundle, lines),
      totals,
      financingCents: financingPerMonthCents(
        totals.activeCents,
        bundle.panel.financing.months,
      ),
    };
  }, [bundle, quantities]);
}

/** "N selected" per category — used by the accordion step headers. */
export function useSelectedCounts() {
  const bundle = useBundleStore((s) => s.bundle);
  const quantities = useBundleStore((s) => s.selection.quantities);
  return useMemo(
    () => countSelectedByCategory(bundle, quantities),
    [bundle, quantities],
  );
}

/** Quantity of a single line — a primitive selector, so only that stepper
 *  re-renders when its own count changes. */
export function useLineQuantity(productId: string, variantId?: string) {
  return useBundleStore((s) =>
    quantityOf(s.selection.quantities, productId, variantId),
  );
}

export function useActiveVariant(productId: string) {
  return useBundleStore((s) => s.selection.activeVariant[productId]);
}

/** Total quantity of a product across its variants — a primitive selector, so a
 *  card re-renders (for its selected-border) only when its own total changes. */
export function useProductQuantity(product: Product) {
  return useBundleStore((s) =>
    productQuantity(product, s.selection.quantities),
  );
}
