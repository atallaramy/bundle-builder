"use client";

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
export function ReviewPanel() {
  const { groups } = useCartModel();

  return (
    <aside
      aria-label="Your security system"
      className="flex flex-col rounded-card bg-panel p-[15px]"
    >
      <p className="text-eyebrow text-label uppercase">Review</p>
      <h2 className="mt-1 text-section text-ink">Your security system</h2>
      <p className="mt-1 text-body text-muted">
        Review your personalized protection system designed to keep what matters
        most safe.
      </p>

      {groups.map((group) => (
        <section
          key={group.category.id}
          className="mt-3 border-t border-line-soft pt-3"
        >
          <p className="text-category text-subhead uppercase">
            {group.category.reviewLabel}
          </p>
          <div className="divide-y divide-line-soft">
            {group.lines.map((line) => (
              <LineItem key={line.key} line={line} />
            ))}
          </div>
        </section>
      ))}

      <div className="mt-3">
        <Totals />
        <Checkout />
      </div>
    </aside>
  );
}
