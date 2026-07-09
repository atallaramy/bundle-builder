"use client";

import Image from "next/image";
import { getBundle } from "@/lib/domain/bundle";
import { formatCents, toCents } from "@/lib/domain/money";
import { useCartModel } from "@/lib/store/hooks";
import { Icon } from "@/components/ui/icons";

const { panel } = getBundle();

/**
 * The review panel's summary rows below the line items: free shipping, the
 * satisfaction badge, the financing estimate, the grand total (compare-at
 * struck), and the savings callout. All figures are derived live from the cart
 * model (DESIGN-SPEC §5, §9); shipping is display-only and never added.
 */
export function Totals() {
  const { totals, financingCents } = useCartModel();

  return (
    <div>
      <div className="flex items-center gap-3 border-t border-line py-3">
        <div className="flex size-[41px] shrink-0 items-center justify-center rounded-control bg-card">
          <Icon name="truck" className="size-[29px]" />
        </div>
        <span className="flex-1 text-body font-semibold text-ink">
          {panel.shipping.label}
        </span>
        <div className="flex flex-col items-end leading-none">
          <span className="text-[14px] leading-4 font-medium text-muted line-through">
            {formatCents(toCents(panel.shipping.compareAt))}
          </span>
          <span className="text-[14px] leading-4 font-semibold text-brand">
            FREE
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-4">
        <Image
          src={panel.guarantee.image}
          alt={panel.guarantee.text}
          width={72}
          height={72}
          className="size-[72px] shrink-0 object-contain"
        />
        <div className="flex flex-col items-end gap-1.5">
          <span className="rounded-[3px] bg-brand px-2 py-0.5 text-[12px] font-medium tracking-[-0.6px] text-white">
            as low as {formatCents(financingCents)}/mo
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[18px] leading-5 font-medium text-muted line-through">
              {formatCents(totals.compareCents)}
            </span>
            <span className="text-total text-brand">
              {formatCents(totals.activeCents)}
            </span>
          </div>
        </div>
      </div>

      {totals.savingsCents > 0 && (
        <p className="mt-3 text-center text-savings text-success">
          Congrats! You&apos;re saving {formatCents(totals.savingsCents)} on
          your security bundle!
        </p>
      )}
    </div>
  );
}
