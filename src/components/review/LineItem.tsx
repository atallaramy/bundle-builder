"use client";

import Image from "next/image";
import { toCents } from "@/lib/domain/money";
import type { CartLine } from "@/lib/domain/cart";
import { Icon } from "@/components/ui/icons";
import { Price } from "@/components/ui/price";
import { QtyStepper } from "@/components/builder/QtyStepper";

/**
 * One review-panel line. Prices shown are line totals (unit × qty). Two special
 * shapes come straight from the data, not hard-coding: a `required` line appends
 * "(Required)" and locks its stepper (Sense Hub → FREE, disabled), and the plan
 * line (`unit === "mo"`, no stepper) shows the shield icon and a "/mo" price
 * with the "Cam Unlimited" brand lockup (DESIGN-SPEC §5).
 */
export function LineItem({ line }: { line: CartLine }) {
  const activeCents = toCents(line.unitActive) * line.qty;
  const compareCents =
    line.unitCompare != null ? toCents(line.unitCompare) * line.qty : undefined;

  const isPlan = line.category === "plan";
  // A two-line price (compare-at above active) top-aligns to the thumbnail; a
  // single price is vertically centred in the row (Figma).
  const hasCompare = compareCents != null && compareCents > activeCents;

  // The plan row is space-between with the lockup top-aligned to its two-line
  // price. Product rows are a single 12px cluster (thumb → name → stepper) with
  // the price 16px after it, top-aligned to the thumbnail (a Figma asymmetry:
  // the cluster is vertically centred, the price hugs the top). Row rhythm
  // (41px rows, 12px between, 8px subhead→first) is owned by the ReviewPanel.
  if (isPlan) {
    return (
      <div className="flex h-8 items-start justify-between">
        <div className="flex min-w-0 items-center gap-[3px]">
          {line.icon && (
            // Plan lockup renders ~20x24 (viewBox 40:48), smaller than the 26px
            // step-header shield — a deliberate size split, not a shared slot.
            <Icon name={line.icon} className="h-6 w-5 shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <PlanName name={line.name} />
          </div>
        </div>
        <Price
          activeCents={activeCents}
          compareCents={compareCents}
          unit={line.unit}
          tone="review"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-[41px] shrink-0 items-center justify-center overflow-hidden rounded-[5px] bg-card">
          {line.image && (
            <Image
              // Decorative — the line name is announced by the adjacent text.
              src={line.image}
              alt=""
              width={41}
              height={41}
              className={
                line.imageFit === "cover"
                  ? "size-full object-cover"
                  : "size-full object-contain"
              }
            />
          )}
        </div>
        <p className="min-w-0 flex-1 text-[14px] leading-4 font-medium tracking-[0.07px] text-ink">
          {line.name}
          {line.required && " (Required)"}
        </p>
        {line.hasStepper && (
          <QtyStepper
            productId={line.productId}
            variantId={line.variantId}
            disabled={line.required}
            label={line.name}
            tone="review"
          />
        )}
      </div>
      <Price
        activeCents={activeCents}
        compareCents={compareCents}
        unit={line.unit}
        tone="review"
        className={hasCompare ? "self-start" : undefined}
      />
    </div>
  );
}

/** "Cam Unlimited" — first word in ink, the rest in brand purple, matching the
 *  Figma's plan lockup. */
function PlanName({ name }: { name: string }) {
  const [first, ...rest] = name.split(" ");
  return (
    // Bold two-tone lockup: first word pure black, rest brand purple. 14px on
    // mobile / 16px desktop (Figma; the 20px was the out-of-scope alt layout).
    <p className="text-[14px] leading-4 font-bold tracking-[-0.028px] lg:text-[16px] lg:tracking-[-0.032px]">
      <span className="text-black">{first}</span>
      {rest.length > 0 && <span className="text-brand"> {rest.join(" ")}</span>}
    </p>
  );
}
