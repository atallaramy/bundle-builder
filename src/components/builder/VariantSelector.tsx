"use client";

import * as RadioGroup from "@radix-ui/react-radio-group";
import Image from "next/image";
import { cn } from "@/lib/cn";
import type { Product } from "@/lib/domain/types";
import { useBundleStore } from "@/lib/store/bundle-store";
import { useActiveVariant } from "@/lib/store/hooks";

/**
 * Row of colour chips for a variated product (DESIGN-SPEC §6). Built on Radix
 * RadioGroup so it gets the full radio keyboard model (single tab stop, roving
 * focus, arrow-key selection) instead of hand-rolled ARIA — single-select "pick
 * a colour" is exactly a radio group. Selecting a chip makes it the *active*
 * variant (which the card's stepper binds to) but touches no quantity, so each
 * variant keeps its own count. The active chip gets a subtle purple border (the
 * brief marks chip highlighting optional; the design shows it and it aids
 * orientation).
 */
export function VariantSelector({ product }: { product: Product }) {
  const variants = product.variants ?? [];
  const active = useActiveVariant(product.id) ?? variants[0]?.id;
  const setActiveVariant = useBundleStore((s) => s.setActiveVariant);

  if (variants.length === 0) return null;

  return (
    <RadioGroup.Root
      value={active}
      onValueChange={(value) => setActiveVariant(product.id, value)}
      orientation="horizontal"
      aria-label={`${product.name} colour`}
      className="flex flex-wrap gap-1.5"
    >
      {variants.map((variant) => (
        <RadioGroup.Item
          key={variant.id}
          value={variant.id}
          className={cn(
            "flex cursor-pointer items-center gap-1.5 rounded-control border bg-card py-1 pr-2.5 pl-1 transition-colors",
            "focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none",
            "border-line hover:border-muted data-[state=checked]:border-brand",
          )}
        >
          <Image
            src={variant.thumb}
            alt=""
            width={20}
            height={20}
            className="size-5 rounded-xs object-contain"
          />
          <span className="text-variant text-ink-soft">{variant.label}</span>
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
