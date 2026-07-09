"use client";

import { cn } from "@/lib/cn";
import type { LayoutVariant } from "@/lib/layout";
import { getBundle } from "@/lib/domain/bundle";
import { toCents } from "@/lib/domain/money";
import { useCartModel } from "@/lib/store/hooks";
import { Icon } from "@/components/ui/icons";
import { Price } from "@/components/ui/price";
import { LineItem } from "./LineItem";
import { Totals } from "./Totals";
import { Checkout } from "./Checkout";

const { panel } = getBundle();

/**
 * "Your security system" — the live review. Reads the derived cart model and
 * renders the selected lines grouped under category subheads (Cameras · Sensors
 * · Accessories · Plan), then the totals and checkout. Everything here is
 * derived; the panel holds no state of its own (DESIGN-SPEC §5).
 */
export function ReviewPanel({ variant = "main" }: { variant?: LayoutVariant }) {
  const { groups } = useCartModel();
  const isAlt = variant === "alt";

  return (
    <aside
      aria-label="Your security system"
      className={cn(
        "rounded-card bg-panel p-[15px]",
        // Main: a single narrow column. Alt desktop: two columns — header +
        // line groups on the left, the totals/checkout summary on the right.
        isAlt
          ? // Alt desktop: two review columns — line groups (552) beside the
            // totals/checkout summary (486), 52px gap (Figma alt frame 70:14135).
            "flex flex-col lg:grid lg:grid-cols-[552px_486px] lg:gap-x-[52px]"
          : // Desktop-main: content is inset 20/29 past the 15px eyebrow gutter,
            // and the bottom-left corner is square (a Figma quirk — an inner
            // same-fill rect reaches the bottom-left but stops short on the right).
            "flex flex-col lg:rounded-bl-none lg:py-[15px] lg:pr-[29px] lg:pl-[20px]",
      )}
    >
      <div className="flex flex-col">
        <p
          className={cn(
            "text-eyebrow text-label uppercase lg:text-[12px] lg:leading-[12px]",
            // Pull the eyebrow back to the 15px panel gutter (content sits at 20).
            // Alt desktop has no eyebrow (its header starts at the H2) — hidden at
            // lg; still shown on mobile, which both routes share.
            isAlt ? "lg:hidden" : "lg:-ml-[5px]",
          )}
        >
          Review
        </p>
        {/* Deliberately distinct from the step section titles: 0.6px tracking +
            #1f1f1f (ink-soft), not the step title's ls0/#0b0d10. Line-height is
            22 here (tight, = font size), not the shared token's 26. Alt scales
            the title to 28px (Figma alt review header). */}
        <h2
          className={cn(
            "mt-[25px] text-section leading-[22px] tracking-[0.6px] text-ink-soft",
            // Alt desktop drops the eyebrow, so the title sits at the column top
            // (aligned with the right column's seal) rather than 25px below it.
            isAlt && "lg:mt-0 lg:text-[28px] lg:leading-[28px]",
          )}
        >
          Your security system
        </h2>
        {/* Subtitle scales per layout (Figma): 12px mobile → 14px main → 16px
            alt; Medium weight (500) in all. */}
        <p
          className={cn(
            "mt-[5px] text-[12px] leading-[15.6px] font-medium tracking-[0.6px] text-ink-soft/75",
            isAlt
              ? "lg:text-[16px] lg:leading-[20.8px]"
              : "lg:text-[14px] lg:leading-[18.2px]",
          )}
        >
          Review your personalized protection system designed to keep what
          matters most safe.
        </p>

        {groups.map((group) => (
          <section
            key={group.category.id}
            className="mt-[10px] border-t border-line pt-[14px]"
          >
            <p className="text-category text-subhead uppercase">
              {group.category.reviewLabel}
            </p>
            {/* Inter-row gap differs by group in the design (all layouts): the
                cameras rows sit 12px apart, every other group 8px. */}
            <div
              className={cn(
                "mt-2 flex flex-col",
                group.category.id === "cameras" ? "gap-3" : "gap-2",
              )}
            >
              {group.lines.map((line) => (
                <LineItem key={line.key} line={line} variant={variant} />
              ))}
            </div>
          </section>
        ))}

        {/* Free shipping is the final line group in the design (a divider + one
            row), not part of the totals block — so it stays in this column in
            both the single-column and alt two-column layouts. */}
        <section className="mt-[10px] border-t border-line pt-[14px]">
          <div className="flex items-center gap-4">
            <div className="flex flex-1 items-center gap-3">
              <div className="flex size-[41px] shrink-0 items-center justify-center rounded-control bg-card">
                <Icon name="truck" className="size-[29px]" />
              </div>
              <span
                className={cn(
                  "flex-1 leading-4 font-medium tracking-[0.07px] text-ink",
                  // Same per-layout scale as the line names: 12 → 14 → 18.
                  "text-[12px]",
                  isAlt ? "lg:text-[18px]" : "lg:text-[14px]",
                )}
              >
                {panel.shipping.label}
              </span>
            </div>
            <Price
              activeCents={0}
              compareCents={toCents(panel.shipping.compareAt)}
              tone="review"
              variant={variant}
            />
          </div>
        </section>
      </div>

      <div className={cn("mt-3", isAlt && "lg:mt-0")}>
        <Totals variant={variant} />
        <Checkout />
      </div>
    </aside>
  );
}
