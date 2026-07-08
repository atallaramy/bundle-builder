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
}

/**
 * `[ − N + ]` — the single stepper used on both product cards and review lines.
 * It reads and writes the same store line, so a card and its review row are the
 * same control pointed at the same state: changing one updates the other and
 * every derived total, with no syncing code (DESIGN-SPEC §7, §10).
 */
export function QtyStepper({
  productId,
  variantId,
  disabled = false,
  label,
}: QtyStepperProps) {
  const qty = useLineQuantity(productId, variantId);
  const increment = useBundleStore((s) => s.increment);
  const decrement = useBundleStore((s) => s.decrement);

  return (
    <div
      className="flex items-center gap-1.5"
      role="group"
      aria-label={`${label} quantity`}
    >
      <StepButton
        icon="minus"
        label={`Decrease ${label} quantity`}
        // `−` is disabled at 0 (can't go negative) and when the line is locked.
        disabled={disabled || qty <= 0}
        onClick={() => decrement(productId, variantId)}
      />
      {/* No aria-live: the same store line drives a stepper on both the card
          and the review row, so a shared live region would double-announce.
          The value is visible and the ± buttons carry labelled names. */}
      <span className="min-w-5 text-center text-stepper text-ink tabular-nums">
        {qty}
      </span>
      <StepButton
        icon="plus"
        label={`Increase ${label} quantity`}
        disabled={disabled}
        onClick={() => increment(productId, variantId)}
      />
    </div>
  );
}

function StepButton({
  icon,
  label,
  disabled,
  onClick,
}: {
  icon: "plus" | "minus";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-7 items-center justify-center rounded-xs bg-chip text-ink transition-colors",
        "focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none",
        disabled
          ? "cursor-not-allowed opacity-40"
          : "cursor-pointer hover:bg-line-soft",
      )}
    >
      <Icon name={icon} className="size-3.5" />
    </button>
  );
}
