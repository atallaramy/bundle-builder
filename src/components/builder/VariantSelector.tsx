"use client";

import * as RadioGroup from "@radix-ui/react-radio-group";
import Image from "next/image";
import { cn } from "@/lib/cn";
import type { Product } from "@/lib/domain/types";
import { useBundleStore } from "@/lib/store/bundle-store";
import { useActiveVariant, useProductQuantity } from "@/lib/store/hooks";

/**
 * Row of colour chips for a variated product (DESIGN-SPEC §6). Built on Radix
 * RadioGroup so it gets the full radio keyboard model (single tab stop, roving
 * focus, arrow-key selection) instead of hand-rolled ARIA — single-select "pick
 * a colour" is exactly a radio group. Selecting a chip makes it the *active*
 * variant (which the card's stepper binds to) but touches no quantity, so each
 * variant keeps its own count. Once the product is in the cart (qty > 0) the
 * active chip gets the green selected treatment (border + fill) from the
 * design; a qty-0 product shows every chip unselected, matching the mock.
 */
export function VariantSelector({ product }: { product: Product }) {
  const variants = product.variants ?? [];
  const active = useActiveVariant(product.id) ?? variants[0]?.id;
  const setActiveVariant = useBundleStore((s) => s.setActiveVariant);
  // Green "selected" chip only once the product is in the cart; a qty-0 product
  // shows every chip unselected (matches the reference).
  const selected = useProductQuantity(product) > 0;

  if (variants.length === 0) return null;

  return (
    <RadioGroup.Root
      value={active}
      onValueChange={(value) => setActiveVariant(product.id, value)}
      orientation="horizontal"
      aria-label={`${product.name} colour`}
      className="flex flex-wrap gap-1.5"
    >
      {variants.map((variant, index) => {
        // Figma varies the chip per swatch POSITION, not selection: the
        // first ("White") swatch gets tighter 3px horizontal padding + a
        // translucent fill; the rest get 5px + a solid white fill (both
        // resolve identically on the white card, but we track the source).
        const isFirst = index === 0;
        return (
          <RadioGroup.Item
            key={variant.id}
            value={variant.id}
            className={cn(
              // 2px thumb→label spacing (Figma packs the 24px thumb tight against
              // the label; a wider gap also overflows the 3-chip row past 205px).
              "flex cursor-pointer items-center gap-0.5 rounded-chip py-px transition-shadow",
              // 0.5px stroke drawn INSIDE (Figma) via an inset shadow, so it
              // never grows the 26px chip box the way a layout border would.
              "shadow-[inset_0_0_0_0.5px_var(--color-chip-border)] hover:shadow-[inset_0_0_0_0.5px_var(--color-muted)]",
              "focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none",
              isFirst ? "bg-transparent px-[3px]" : "bg-card px-[5px]",
              selected &&
                "data-[state=checked]:bg-chip-selected-bg data-[state=checked]:shadow-[inset_0_0_0_0.5px_var(--color-success)]",
            )}
          >
            <Image
              src={variant.thumb}
              alt=""
              width={24}
              height={24}
              className={cn(
                "size-6 object-contain",
                // Cam v4 swatches are rounded product-frame thumbs (cr5);
                // every other product's swatch is a flat rectangle (cr0).
                product.framedThumb ? "rounded-[5px]" : "rounded-none",
              )}
            />
            <span className="text-variant text-ink-soft">{variant.label}</span>
          </RadioGroup.Item>
        );
      })}
    </RadioGroup.Root>
  );
}
