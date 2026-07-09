import { cn } from "@/lib/cn";
import { formatCents } from "@/lib/domain/money";

/**
 * The price stack shown on cards and review lines: an optional struck-through
 * compare-at above the active price, right-aligned. An active price of 0 renders
 * as "FREE" (derived from the value, never a flag). The two tones differ in both
 * prices: cards use a grey active (`#575757`) over a red struck compare-at; the
 * review uses a brand-purple active over a muted-grey compare-at (DESIGN-SPEC §2, §5).
 */
export function Price({
  activeCents,
  compareCents,
  unit,
  tone,
  className,
}: {
  activeCents: number;
  compareCents?: number;
  unit?: "mo";
  tone: "card" | "review";
  className?: string;
}) {
  const suffix = unit === "mo" ? "/mo" : "";
  // Only strike a compare-at that is genuinely higher than the active price.
  const showCompare = compareCents != null && compareCents > activeCents;
  const isFree = activeCents === 0;

  // Size + tracking differ by surface (Figma): the card price is 16px/0.6px, the
  // review price is a smaller 14px/0.07px. The /mo suffix is NOT dimmed — it
  // inherits the active colour (purple on the plan line), per the design.
  const sizeCls =
    tone === "card"
      ? "text-[16px] leading-4 tracking-[0.6px]"
      : "text-[14px] leading-4 tracking-[0.07px]";

  return (
    <div className={cn("flex flex-col items-end leading-none", className)}>
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
