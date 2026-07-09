"use client";

import Image from "next/image";
import { getBundle } from "@/lib/domain/bundle";
import { formatCents } from "@/lib/domain/money";
import { useCartModel } from "@/lib/store/hooks";

const { panel } = getBundle();

/**
 * The review panel's summary below the line items: the satisfaction badge, the
 * financing estimate, the grand total (compare-at struck), and the savings
 * callout. Free shipping is NOT here — in the design it's the last *line group*
 * (rendered by ReviewPanel), not part of this totals block. All figures are
 * derived live from the cart model (DESIGN-SPEC §5, §9).
 */
export function Totals() {
  const { totals, financingCents } = useCartModel();

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <Image
          src={panel.guarantee.image}
          alt={panel.guarantee.text}
          width={78}
          height={78}
          className="size-[78px] shrink-0 object-contain"
        />
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-[3px] bg-brand px-2 py-[1.7px] text-[12px] leading-[14.56px] font-medium tracking-[-0.6px] text-white">
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
