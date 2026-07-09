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
        // Horizontal layout (Figma): image column | content column, 19px gap.
        // Columns stretch to equal height so the image centres against the
        // content and clears the absolute badge.
        "relative flex items-center rounded-card bg-card p-[11px]",
        // Transparent border when unselected keeps geometry stable on selection;
        // the selected purple is 70% opacity per the design (a softer purple).
        // Image→content gap is state-dependent in Figma: 19px selected, 13px not.
        selected
          ? "gap-[19px] border-2 border-brand/70"
          : "gap-[13px] border-2 border-transparent",
      )}
    >
      {product.discountBadge && (
        <span className="absolute top-[11px] left-[11px] z-10 rounded-full bg-brand px-1.5 py-0.5 text-badge text-white">
          {product.discountBadge}
        </span>
      )}

      <div className="flex w-24 shrink-0 items-center justify-center">
        {heroSrc ? (
          <Image
            src={heroSrc}
            alt={product.name}
            width={96}
            height={96}
            className="size-full object-contain"
          />
        ) : product.icon ? (
          <Icon name={product.icon} className="size-12" />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex flex-col gap-2">
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
        </div>
        {hasVariants && <VariantSelector product={product} />}

        {/* Stepper + price sit inside the content column (indented past the
            image). The content column keeps its natural height and is centred
            vertically in the card (Figma counterAxisAlignItems: CENTER), so on
            a short card stretched to its row's height the block sits centred
            rather than pinned to the top or bottom. */}
        <div className="flex items-end justify-between gap-2.5">
          {hasStepper ? (
            // `stepperVariantId` is undefined for unvariated products, which the
            // stepper treats as the product's own line. Required products (Sense
            // Hub) keep the stepper locked here too, matching the review line.
            <QtyStepper
              productId={product.id}
              variantId={stepperVariantId}
              disabled={product.required === true}
              label={product.name}
              tone="card"
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
      </div>
    </article>
  );
}
