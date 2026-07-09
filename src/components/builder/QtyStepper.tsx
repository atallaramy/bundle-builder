"use client";

import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icons";
import { useBundleStore } from "@/lib/store/bundle-store";
import { useLineQuantity } from "@/lib/store/hooks";

interface QtyStepperProps {
  productId: string;
  variantId?: string;
  /** Fully lock the control (Sense Hub "Required" stays at its locked qty). */
  disabled?: boolean;
  /** Accessible name for the group, e.g. the product/line name. */
  label: string;
  /**
   * Which surface the stepper sits on. The Figma design uses two *distinct*
   * stepper looks — the card one and the review one are not the same control
   * (proven by one product at one qty rendering both simultaneously) — so this
   * is a real design axis, not styling sugar:
   *  - `card`   → 80px, centred, 16px number; +/- boxes are grey #f0f4f7 with a
   *               #525963 glyph, EXCEPT the minus at qty ≤ 1 which reads inactive
   *               (white box, #e6ebf0 border, light #ced6de glyph).
   *  - `review` → 72px, space-between, 14px number; both boxes white, #575757
   *               glyph; a locked (Required) line uses a #f1f1f2 box + #ced6de
   *               border with the glyph unchanged (never dimmed).
   */
  tone: "card" | "review";
}

/**
 * `[ − N + ]` — the quantity stepper on product cards and review lines. It reads
 * and writes the same store line, so a card and its review row are the same
 * state pointed at from two surfaces: changing one updates the other and every
 * derived total with no syncing code (DESIGN-SPEC §7, §10). The two surfaces
 * render different looks via `tone`.
 */
export function QtyStepper({
  productId,
  variantId,
  disabled = false,
  label,
  tone,
}: QtyStepperProps) {
  const qty = useLineQuantity(productId, variantId);
  const increment = useBundleStore((s) => s.increment);
  const decrement = useBundleStore((s) => s.decrement);

  return (
    <div
      className={cn(
        "flex items-center",
        tone === "card"
          ? "w-20 justify-center gap-2.5"
          : "w-[72px] justify-between",
      )}
      role="group"
      aria-label={`${label} quantity`}
    >
      <StepButton
        icon="minus"
        label={`Decrease ${label} quantity`}
        tone={tone}
        // Card minus reads "active" only at qty ≥ 2 (Figma flips it at 1→2).
        active={tone === "review" || qty >= 2}
        locked={disabled}
        // Functionally can't go below 0 or when the line is locked.
        onClick={
          qty > 0 && !disabled
            ? () => decrement(productId, variantId)
            : undefined
        }
      />
      {/* No aria-live: the same store line drives a stepper on both the card
          and the review row, so a shared live region would double-announce. */}
      <span
        className={cn(
          "text-center text-ink tabular-nums",
          // Digit weight is a per-tone design axis: card 500, review 600.
          tone === "card"
            ? "min-w-5 text-[16px] leading-5 font-medium"
            : "text-[14px] leading-4 font-semibold",
        )}
      >
        {qty}
      </span>
      <StepButton
        icon="plus"
        label={`Increase ${label} quantity`}
        tone={tone}
        active
        locked={disabled}
        onClick={!disabled ? () => increment(productId, variantId) : undefined}
      />
    </div>
  );
}

function StepButton({
  icon,
  label,
  tone,
  active,
  locked,
  onClick,
}: {
  icon: "plus" | "minus";
  label: string;
  tone: "card" | "review";
  /** Whether this button shows the emphasised (dark-glyph) look. */
  active: boolean;
  /** Required/locked line — a distinct bordered look, never dimmed. */
  locked: boolean;
  onClick?: () => void;
}) {
  const look =
    tone === "card"
      ? locked || !active
        ? // inactive / at-minimum: white box, soft border, light glyph
          "border-2 border-line-soft bg-card text-line"
        : // active: grey box, dark glyph
          "bg-panel-alt text-stepper-glyph"
      : locked
        ? // review locked (Required): grey box + hairline border, glyph unchanged
          "border border-line bg-chip text-ink-price"
        : // review normal: white box, no border, dark-grey glyph
          "bg-card text-ink-price";

  return (
    <button
      type="button"
      aria-label={label}
      disabled={onClick === undefined}
      onClick={onClick}
      className={cn(
        "flex size-5 items-center justify-center rounded-xs transition-colors",
        "focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none",
        look,
        onClick === undefined ? "cursor-not-allowed" : "cursor-pointer",
      )}
    >
      <Icon name={icon} className="size-2" />
    </button>
  );
}
