"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import type { LayoutVariant } from "@/lib/layout";
import { getBundle } from "@/lib/domain/bundle";
import { formatCents } from "@/lib/domain/money";
import { useCartModel } from "@/lib/store/hooks";

const { panel } = getBundle();

/**
 * The review panel's summary below the line items: the satisfaction seal, the
 * financing estimate, the grand total (compare-at struck), and the savings
 * callout. Free shipping is NOT here — in the design it's the last *line group*
 * (rendered by ReviewPanel), not part of this totals block.
 *
 * Two arrangements (Figma), by `variant`:
 *  - main / mobile — seal (78) at the left, the financing pill stacked above the
 *    total at the right; 12px savings.
 *  - alt desktop  — the seal grows to 131 with a "30-day hassle-free returns"
 *    blurb beside it (top row), the pill sits LEFT / total RIGHT on the row
 *    below, and the total + savings scale up (22/28px total, 14px savings).
 * The mobile rendering is shared by both routes, so every alt change is `lg:`.
 * All figures are derived live from the cart model (DESIGN-SPEC §5, §9).
 */
export function Totals({ variant = "main" }: { variant?: LayoutVariant }) {
  const { totals, financingCents } = useCartModel();
  const isAlt = variant === "alt";

  const pill = (
    <span
      className={cn(
        "shrink-0 rounded-[3px] bg-brand px-2 py-[1.7px] text-[12px] leading-[14.56px] font-medium tracking-[-0.6px] text-white",
        // Alt desktop: a larger pill (~145×27, 16px) at the left of its own row.
        isAlt &&
          "lg:py-[3.8px] lg:text-[16px] lg:leading-[19.41px] lg:tracking-[-0.8px]",
      )}
    >
      as low as {formatCents(financingCents)}/mo
    </span>
  );

  const total = (
    <div className="flex items-baseline gap-2">
      <span
        className={cn(
          "text-[18px] leading-5 font-medium text-muted line-through",
          isAlt && "lg:text-[22px]",
        )}
      >
        {formatCents(totals.compareCents)}
      </span>
      <span
        // `key` remounts the span when the total changes → replays the subtle
        // fade-in tick (motion-safe; opacity-only, no layout shift).
        key={totals.activeCents}
        className={cn(
          "text-total text-brand motion-safe:animate-[total-tick_130ms_ease-out]",
          isAlt && "lg:text-[28px]",
        )}
      >
        {formatCents(totals.activeCents)}
      </span>
    </div>
  );

  return (
    <div>
      <div
        className={cn(
          "flex items-center justify-between gap-3",
          // Alt desktop: seal+returns is the top row, pill+total the row below.
          isAlt && "lg:flex-col lg:items-stretch lg:gap-4",
        )}
      >
        {/* Seal (+ alt-only returns blurb beside it). */}
        <div
          className={cn("flex items-center gap-3", isAlt && "lg:gap-[25px]")}
        >
          <Image
            src={panel.guarantee.image}
            alt={panel.guarantee.text}
            width={131}
            height={131}
            className={cn(
              "size-[78px] shrink-0 object-contain",
              isAlt && "lg:size-[131px]",
            )}
          />
          {isAlt && (
            // 18px Gilroy; the heading is SemiBold (Figma styleOverrideTable),
            // the body Regular, separated by one blank line (mt = 1 line height).
            <div className="hidden text-[18px] leading-[19.8px] tracking-[0.6px] text-ink-soft lg:block">
              <p className="font-semibold">{panel.guarantee.returnsHeading}</p>
              <p className="mt-[19.8px]">{panel.guarantee.returnsBody}</p>
            </div>
          )}
        </div>

        {/* Pill + grand total: stacked at the right on main/mobile; a single
            pill-left / total-right row on alt desktop. */}
        <div
          className={cn(
            "flex flex-col items-end gap-2",
            isAlt &&
              "lg:w-full lg:flex-row lg:items-center lg:justify-between lg:gap-0",
          )}
        >
          {pill}
          {total}
        </div>
      </div>

      {totals.savingsCents > 0 && (
        <p
          className={cn(
            "mt-3 text-center text-savings text-success",
            // Alt desktop scales the savings to 14px (gap above ≈14px, Figma).
            isAlt && "lg:mt-[14px] lg:text-[14px] lg:leading-[14px]",
          )}
        >
          Congrats! You&apos;re saving {formatCents(totals.savingsCents)} on
          your security bundle!
        </p>
      )}
    </div>
  );
}
