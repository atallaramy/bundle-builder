import { cn } from "@/lib/cn";
import type { LayoutVariant } from "@/lib/layout";
import { formatCents } from "@/lib/domain/money";

/**
 * The price stack shown on cards and review lines: an optional struck-through
 * compare-at above the active price, right-aligned. An active price of 0 renders
 * as "FREE" (derived from the value, never a flag). The two tones differ in both
 * prices: cards use a grey active (`#575757`) over a red struck compare-at; the
 * review uses a brand-purple active over a muted-grey compare-at (DESIGN-SPEC §2, §5).
 *
 * The review price also has a per-layout scale (Figma): 12px on mobile, 14px on
 * desktop-main, 16px on desktop-alt — and desktop-alt lays the two prices out
 * HORIZONTALLY (compare left of active) rather than stacked. `variant` drives the
 * desktop side; the mobile base is shared by both routes. Card prices are 16px
 * everywhere, so `variant` is inert for the card tone.
 */
export function Price({
  activeCents,
  compareCents,
  unit,
  tone,
  variant = "main",
  className,
}: {
  activeCents: number;
  compareCents?: number;
  unit?: "mo";
  tone: "card" | "review";
  variant?: LayoutVariant;
  className?: string;
}) {
  const suffix = unit === "mo" ? "/mo" : "";
  // Only strike a compare-at that is genuinely higher than the active price.
  const showCompare = compareCents != null && compareCents > activeCents;
  const isFree = activeCents === 0;
  const isAlt = tone === "review" && variant === "alt";

  // Size + tracking differ by surface (Figma): the card price is a fixed
  // 16px/0.6px; the review price scales 12→14→16 across mobile→main→alt.
  const sizeCls =
    tone === "card"
      ? "text-[16px] leading-4 tracking-[0.6px]"
      : cn(
          "text-[12px] leading-4 tracking-[0.07px]",
          isAlt ? "lg:text-[16px]" : "lg:text-[14px]",
        );

  return (
    <div
      className={cn(
        "flex flex-col items-end leading-none",
        // Card price stack has a 3px compare→active gap (Figma); review abuts.
        tone === "card" && "gap-[3px]",
        // Alt review desktop: compare + active sit side by side (compare left),
        // baseline-aligned; mobile keeps the shared stacked layout.
        isAlt && "lg:flex-row lg:items-baseline lg:gap-2",
        className,
      )}
    >
      {showCompare && (
        <span
          className={cn(
            sizeCls,
            "line-through",
            // Card compare = red, Regular; review compare = muted grey, Medium (§2).
            tone === "card"
              ? "font-normal text-danger"
              : "font-medium text-muted",
          )}
        >
          {formatCents(compareCents)}
          {suffix}
        </span>
      )}
      <span
        className={cn(
          sizeCls,
          // Cards render the active price at regular weight; the review renders
          // it heavier (semibold) — the review reads bolder than the card (§5).
          tone === "card"
            ? "font-normal text-ink-price"
            : "font-semibold text-brand",
        )}
      >
        {isFree ? (
          "FREE"
        ) : (
          <>
            {formatCents(activeCents)}
            {suffix}
          </>
        )}
      </span>
    </div>
  );
}
