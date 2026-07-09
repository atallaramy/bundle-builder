"use client";

import { cn } from "@/lib/cn";
import type { LayoutVariant } from "@/lib/layout";
import { useCartModel } from "@/lib/store/hooks";
import { LineItem } from "./LineItem";
import { Totals } from "./Totals";
import { Checkout } from "./Checkout";

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
          : "flex flex-col",
      )}
    >
      <div className="flex flex-col">
        <p className="text-eyebrow text-label uppercase lg:text-[12px] lg:leading-[12px]">
          Review
        </p>
        {/* Deliberately distinct from the step section titles: 0.6px tracking +
            #1f1f1f (ink-soft), not the step title's ls0/#0b0d10. */}
        <h2 className="mt-1 text-section tracking-[0.6px] text-ink-soft">
          Your security system
        </h2>
        <p className="mt-1 text-body text-ink-soft">
          Review your personalized protection system designed to keep what
          matters most safe.
        </p>

        {groups.map((group) => (
          <section
            key={group.category.id}
            className="mt-3 border-t border-line pt-3"
          >
            <p className="text-category text-subhead uppercase">
              {group.category.reviewLabel}
            </p>
            <div>
              {group.lines.map((line) => (
                <LineItem key={line.key} line={line} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className={cn("mt-3", isAlt && "lg:mt-0")}>
        <Totals />
        <Checkout />
      </div>
    </aside>
  );
}
