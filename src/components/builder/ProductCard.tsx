"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import type { LayoutVariant } from "@/lib/layout";
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
export function ProductCard({
  product,
  variant = "main",
}: {
  product: Product;
  variant?: LayoutVariant;
}) {
  const isAlt = variant === "alt";
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
  // The Plan is the sparsest product — an icon, a name and a price, with no
  // photo, description, variants or stepper. It gets a tidied layout so the
  // shared card doesn't read as dead space. Camera cards always carry an image,
  // so they never enter this branch (`heroSrc` is truthy) and stay untouched.
  const isIconOnly = !heroSrc && !!product.icon;

  const selected = totalQty > 0;

  return (
    <article
      className={cn(
        // Base (mobile + main desktop): horizontal image column | content
        // column. Columns stretch to equal height so the image centres against
        // the content and clears the absolute badge.
        "relative flex items-center rounded-card bg-card p-[11px]",
        // Selected: a 2px brand ring drawn as an INSET shadow, matching Figma's
        // inside-aligned stroke — it overlaps rather than insetting content the
        // way a layout border would, so geometry is identical selected/unselected
        // (no jump). Image→content gap is state-dependent: 19px selected, 13px not.
        selected
          ? "gap-[19px] shadow-[inset_0_0_0_2px_var(--color-brand)]"
          : "gap-[13px]",
        // Alt desktop: stack vertically (image on top, content below) and flex
        // to fill an equal share of the horizontal card row the /alt step lays
        // out — but capped at the camera-card width so a step with fewer products
        // than Cameras doesn't balloon a lone card across the whole row (the row
        // itself centres the capped cards, see StepAccordion).
        isAlt &&
          "lg:max-w-[215px] lg:min-w-0 lg:flex-1 lg:flex-col lg:items-stretch lg:gap-3",
      )}
    >
      {product.discountBadge && (
        <span className="absolute top-[11px] left-[11px] z-10 rounded-full bg-brand px-1.5 py-0.5 text-badge text-white">
          {product.discountBadge}
        </span>
      )}

      <div
        className={cn(
          // Figma media box is ~101px wide; our square assets render undistorted
          // at 101×101 (matches the doorbell/battery media exactly; the tall
          // cameras' 101×137 can't be filled without cropping square art).
          "flex size-[101px] shrink-0 items-center justify-center",
          // Alt desktop: the media spans the full card width with a fixed
          // height, matching the image-on-top vertical card.
          isAlt && "lg:h-[140px] lg:w-full lg:shrink",
        )}
      >
        {heroSrc ? (
          <Image
            src={heroSrc}
            alt={product.name}
            width={101}
            height={101}
            className="size-full object-contain"
          />
        ) : product.icon ? (
          // The Plan icon fills more of the media box than the old 48px so the
          // sparse card doesn't read as a small glyph floating in empty space;
          // larger still in the taller alt media area.
          <Icon
            name={product.icon}
            className={cn("size-16", isAlt && "lg:size-20")}
          />
        ) : null}
      </div>

      {/* Content column: Figma caps it at 205px (the price/stepper row + text
          wrap to that width, leaving dead space before the right padding). Only
          at the two-column desktop widths (lg, non-alt); mobile + the alt
          vertical cards fill their width. */}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-2.5",
          !isAlt && "lg:max-w-[205px]",
        )}
      >
        <div className="flex flex-col gap-2">
          {/* Alt desktop cards use larger type (Figma): title 18px, desc 14px. */}
          <h4
            className={cn(
              "text-product text-ink-soft",
              isAlt && "lg:text-[18px] lg:leading-[18px]",
            )}
          >
            {product.name}
          </h4>
          {product.description && (
            <p
              className={cn(
                "text-description text-ink-soft/75",
                isAlt && "lg:text-[14px] lg:leading-[18.2px]",
              )}
            >
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
        <div
          className={cn(
            "flex items-center gap-2.5",
            // The Plan card has no stepper, so a right-aligned price would float
            // alone at the card's far edge (a disconnected name-top / price-right
            // diagonal across empty space). Instead its name + price stack
            // together, left-aligned, as one tidy block on the horizontal layouts;
            // the alt vertical card keeps the price bottom-right to match the
            // other alt cards. Every card that has a stepper is unchanged.
            isIconOnly
              ? isAlt
                ? "justify-start lg:justify-between"
                : "justify-start"
              : "justify-between",
          )}
        >
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
