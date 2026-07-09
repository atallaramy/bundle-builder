"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import type { LayoutVariant } from "@/lib/layout";
import { toCents } from "@/lib/domain/money";
import type { CartLine } from "@/lib/domain/cart";
import { Icon } from "@/components/ui/icons";
import { Price } from "@/components/ui/price";
import { QtyStepper } from "@/components/builder/QtyStepper";

// Review line name scales per layout (Figma): 12px mobile → 14px main → 18px alt.
// The mobile base is shared by both routes; `variant` drives the desktop size.
const nameSize = (variant: LayoutVariant) =>
  cn("text-[12px]", variant === "alt" ? "lg:text-[18px]" : "lg:text-[14px]");

/**
 * One review-panel line. Prices shown are line totals (unit × qty). Two special
 * shapes come straight from the data, not hard-coding: a `required` line appends
 * "(Required)" and locks its stepper (Sense Hub → FREE, disabled), and the plan
 * line (`unit === "mo"`, no stepper) shows the shield icon and a "/mo" price
 * with the "Cam Unlimited" brand lockup (DESIGN-SPEC §5).
 */
export function LineItem({
  line,
  variant = "main",
}: {
  line: CartLine;
  variant?: LayoutVariant;
}) {
  const activeCents = toCents(line.unitActive) * line.qty;
  const compareCents =
    line.unitCompare != null ? toCents(line.unitCompare) * line.qty : undefined;

  const isPlan = line.category === "plan";
  const isAlt = variant === "alt";
  // A two-line (stacked) price top-aligns to the thumbnail; a single price is
  // centred. Alt desktop lays the two prices out horizontally (one line), so it
  // centres — but its mobile rendering is still stacked, hence the lg override.
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
            // It scales up with the 20px alt plan name (Figma alt: ~26x31).
            <Icon
              name={line.icon}
              className={cn(
                "h-6 w-5 shrink-0",
                isAlt && "lg:h-[31px] lg:w-[26px]",
              )}
            />
          )}
          <div className="min-w-0 flex-1">
            <PlanName name={line.name} variant={variant} />
          </div>
        </div>
        <Price
          activeCents={activeCents}
          compareCents={compareCents}
          unit={line.unit}
          tone="review"
          variant={variant}
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
        <p
          className={cn(
            "min-w-0 flex-1 leading-4 font-medium tracking-[0.07px] text-ink",
            nameSize(variant),
          )}
        >
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
        variant={variant}
        // Stacked two-line price top-aligns to the thumbnail; a single line
        // centres. Alt desktop lays the pair out horizontally (one line) so it
        // centres there, while its mobile rendering stays stacked/top-aligned.
        className={
          hasCompare ? cn("self-start", isAlt && "lg:self-center") : undefined
        }
      />
    </div>
  );
}

/** "Cam Unlimited" — first word in ink, the rest in brand purple, matching the
 *  Figma's plan lockup. Bold two-tone; sizes 14 (mobile) → 16 (main) → 20 (alt). */
function PlanName({ name, variant }: { name: string; variant: LayoutVariant }) {
  const [first, ...rest] = name.split(" ");
  return (
    <p
      className={cn(
        "text-[14px] leading-[14px] font-bold tracking-[-0.028px]",
        variant === "alt"
          ? "lg:text-[20px] lg:leading-5 lg:tracking-[-0.04px]"
          : "lg:text-[16px] lg:leading-4 lg:tracking-[-0.032px]",
      )}
    >
      <span className="text-black">{first}</span>
      {rest.length > 0 && <span className="text-brand"> {rest.join(" ")}</span>}
    </p>
  );
}
