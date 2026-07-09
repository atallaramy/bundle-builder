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

  return (
    <div className="flex items-center gap-3 py-3">
      {isPlan && line.icon ? (
        <Icon name={line.icon} className="size-6 shrink-0" />
      ) : (
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
      )}

      <div className="min-w-0 flex-1">
        {isPlan ? (
          <PlanName name={line.name} />
        ) : (
          <p className="text-[14px] leading-4 font-medium tracking-[0.07px] text-ink">
            {line.name}
            {line.required && " (Required)"}
          </p>
        )}
      </div>

      {line.hasStepper && (
        <QtyStepper
          productId={line.productId}
          variantId={line.variantId}
          disabled={line.required}
          label={line.name}
          tone="review"
        />
      )}

      <Price
        activeCents={activeCents}
        compareCents={compareCents}
        unit={line.unit}
        tone="review"
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
