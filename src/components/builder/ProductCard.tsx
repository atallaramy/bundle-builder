"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { toCents } from "@/lib/domain/money";
import type { Product } from "@/lib/domain/types";
import { useActiveVariant, useProductQuantity } from "@/lib/store/hooks";
import { Icon } from "@/components/ui/icons";
import { Price } from "@/components/ui/price";
import { QtyStepper } from "./QtyStepper";
import { VariantSelector } from "./VariantSelector";

/**
 * One product card, rendered entirely from catalog data (BRIEF "Data"): each
 * element appears only if the product carries it — badge, description, Learn
 * More, variant chips, stepper. A card with quantity > 0 gets the 2px purple
 * selected border (DESIGN-SPEC §5). The stepper is bound to the active variant,
 * so per-variant counts stay separate (§6).
 */
export function ProductCard({ product }: { product: Product }) {
  const totalQty = useProductQuantity(product);
  const activeVariantId = useActiveVariant(product.id);
  const hasVariants = (product.variants?.length ?? 0) > 0;
  const hasStepper = product.hasStepper !== false;

  // The stepper edits the active variant (falling back to the first) for
  // variated products, or the product itself when there are no variants.
  const stepperVariantId = hasVariants
    ? (activeVariantId ?? product.variants?.[0]?.id)
    : undefined;
  const activeVariant = product.variants?.find(
    (v) => v.id === stepperVariantId,
  );
  const heroSrc = activeVariant?.image ?? product.image;

  const selected = totalQty > 0;

  return (
    <article
      className={cn(
        "relative flex flex-col gap-3 rounded-card bg-card p-[11px]",
        // Transparent border when unselected keeps geometry stable on selection.
        selected ? "border-2 border-brand" : "border-2 border-transparent",
      )}
    >
      {product.discountBadge && (
        <span className="absolute top-2.5 left-2.5 z-10 rounded-control bg-brand px-2 py-1 text-badge text-white">
          {product.discountBadge}
        </span>
      )}

      <div className="flex gap-3">
        <div className="flex size-24 shrink-0 items-center justify-center">
          {heroSrc ? (
            <Image
              src={heroSrc}
              alt={product.name}
              width={96}
              height={96}
              className="size-full object-contain"
            />
          ) : product.icon ? (
            <Icon name={product.icon} className="size-12 text-brand" />
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h4 className="text-product text-ink">{product.name}</h4>
          {product.description && (
            <p className="text-body text-ink-soft/75">
              {product.description}{" "}
              {product.learnMore && (
                // Placeholder — the brief specifies no destination for this link.
                <span className="cursor-pointer text-link underline">
                  Learn More
                </span>
              )}
            </p>
          )}
          {hasVariants && <VariantSelector product={product} />}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3">
        {hasStepper ? (
          // `stepperVariantId` is undefined for unvariated products, which the
          // stepper treats as the product's own line. Required products (Sense
          // Hub) keep the stepper locked here too, matching the review line.
          <QtyStepper
            productId={product.id}
            variantId={stepperVariantId}
            disabled={product.required === true}
            label={product.name}
          />
        ) : (
          <span aria-hidden />
        )}
        <Price
          activeCents={toCents(product.price.active)}
          compareCents={
            product.price.compareAt != null
              ? toCents(product.price.compareAt)
              : undefined
          }
          unit={product.price.unit}
          tone="card"
        />
      </div>
    </article>
  );
}
