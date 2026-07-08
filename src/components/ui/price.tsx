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

  return (
    <div className={cn("flex flex-col items-end leading-none", className)}>
      {showCompare && (
        <span
          className={cn(
            "text-price font-medium line-through",
            // Card compares strike red; review compares are muted grey (§2).
            tone === "card" ? "text-danger" : "text-muted",
          )}
        >
          {formatCents(compareCents)}
          {suffix}
        </span>
      )}
      <span
        className={cn(
          "text-price",
          tone === "card" ? "text-ink-price" : "text-brand",
        )}
      >
        {isFree ? (
          "FREE"
        ) : (
          <>
            {formatCents(activeCents)}
            {suffix && <span className="text-muted">{suffix}</span>}
          </>
        )}
      </span>
    </div>
  );
}
