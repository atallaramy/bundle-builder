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
          ? "flex flex-col lg:grid lg:grid-cols-2 lg:gap-x-10"
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
            !isAlt && "lg:-ml-[5px]",
          )}
        >
          Review
        </p>
        {/* Deliberately distinct from the step section titles: 0.6px tracking +
            #1f1f1f (ink-soft), not the step title's ls0/#0b0d10. Line-height is
            22 here (tight, = font size), not the shared token's 26. */}
        <h2 className="mt-[25px] text-section leading-[22px] tracking-[0.6px] text-ink-soft">
          Your security system
        </h2>
        <p className="mt-[5px] text-body text-ink-soft/75">
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
            <div className="mt-2 flex flex-col gap-3">
              {group.lines.map((line) => (
                <LineItem key={line.key} line={line} />
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
              <span className="flex-1 text-[14px] leading-4 font-medium tracking-[0.07px] text-ink">
                {panel.shipping.label}
              </span>
            </div>
            <Price
              activeCents={0}
              compareCents={toCents(panel.shipping.compareAt)}
              tone="review"
            />
          </div>
        </section>
      </div>

      <div className={cn("mt-3", isAlt && "lg:mt-0")}>
        <Totals />
        <Checkout />
      </div>
    </aside>
  );
}
