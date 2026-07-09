"use client";

import { cn } from "@/lib/cn";
import type { LayoutVariant } from "@/lib/layout";
import { getBundle } from "@/lib/domain/bundle";
import type { Category } from "@/lib/domain/types";
import { useBundleStore } from "@/lib/store/bundle-store";
import { useSelectedCounts } from "@/lib/store/hooks";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Icon } from "@/components/ui/icons";
import { ProductCard } from "./ProductCard";

const bundle = getBundle();
const steps = [...bundle.categories].sort((a, b) => a.step - b.step);
const TOTAL_STEPS = steps.length;

/**
 * The four-step builder. A single Radix accordion (single-open, collapsible),
 * controlled by the store's `openStep` so it stays one source of truth with the
 * "Next" buttons. The open step renders as a tinted rounded panel; collapsed
 * steps are hairline-divided rows (DESIGN-SPEC §1, §5).
 */
export function StepAccordion({
  variant = "main",
}: {
  variant?: LayoutVariant;
}) {
  const openStep = useBundleStore((s) => s.openStep);
  const setOpenStep = useBundleStore((s) => s.setOpenStep);

  return (
    <Accordion
      type="single"
      collapsible
      // Radix speaks strings; map to/from our numeric step ("" = all closed).
      value={openStep != null ? String(openStep) : ""}
      onValueChange={(value) => setOpenStep(value ? Number(value) : null)}
      // 13px between every step (DESIGN-SPEC §1) — one gap rule for both the
      // tinted open panel and the collapsed rows, so the rhythm matches Figma.
      className="flex flex-col gap-[13px]"
    >
      {steps.map((category) => (
        <Step
          key={category.id}
          category={category}
          onAdvance={setOpenStep}
          variant={variant}
        />
      ))}
    </Accordion>
  );
}

function Step({
  category,
  onAdvance,
  variant,
}: {
  category: Category;
  onAdvance: (step: number) => void;
  variant: LayoutVariant;
}) {
  const isAlt = variant === "alt";
  const counts = useSelectedCounts();
  const count = counts[category.id];
  const products = bundle.products.filter((p) => p.category === category.id);
  const nextStep = steps.find((c) => c.step === category.step + 1);

  return (
    <AccordionItem
      value={String(category.step)}
      className={cn(
        // Open step: tinted rounded panel (fill + radius only — the reference
        // panel carries no stroke). Inter-step spacing is the parent's 13px gap;
        // the step-separator hairlines live on the title row below, not here.
        "data-[state=open]:rounded-card data-[state=open]:bg-panel",
      )}
    >
      <AccordionHeader>
        {/* Only the open (tinted) panel carries the 15px inner padding (Figma
            Frame 538). Collapsed rows have no vertical padding — the eyebrow sits
            at the cell top and the bottom hairline at its base — so the 13px
            inter-step gap does the spacing, matching Figma's tight rhythm. The
            5px gap is the eyebrow→hairline spacing on every step. */}
        <AccordionTrigger className="group flex w-full cursor-pointer flex-col gap-[5px] px-[15px] text-left data-[state=open]:py-[15px]">
          <span
            className={cn(
              "text-eyebrow text-label uppercase lg:group-data-[state=open]:text-[12px] lg:group-data-[state=open]:leading-[12px]",
              // Alt desktop: the eyebrow is 12px on every step (open AND collapsed,
              // unlike main which keeps collapsed at 10px) and centred above the
              // full-width panel.
              isAlt &&
                "lg:w-full lg:text-center lg:text-[12px] lg:leading-[12px]",
            )}
          >
            Step {category.step} of {TOTAL_STEPS}
          </span>
          {/* Title row. A full-bleed hairline sits under the eyebrow on every
              step (Figma "Frame 25" top stroke, spanning the whole 768px column);
              collapsed steps add a second hairline under the title (its bottom
              stroke). `w-[calc(100%+30px)]` + `-mx-[15px]` makes the border-box
              bleed past the trigger's 15px padding on BOTH sides (plain `w-full`
              only shifts the box, leaving it 30px short on the right). Padding
              20px top/bottom matches Figma's 67px collapsed row rhythm. */}
          <span className="-mx-[15px] flex w-[calc(100%+30px)] items-center gap-2 border-t-[0.5px] border-[#1f1f1f] px-[15px] pt-5 group-data-[state=closed]:border-b-[0.5px] group-data-[state=closed]:pb-5">
            <Icon
              name={category.icon}
              className="size-5 shrink-0 lg:size-[26px]"
            />
            <span
              className={cn(
                "text-[18px] leading-[18px] font-semibold text-ink lg:text-[22px] lg:leading-[22px]",
                // Alt desktop titles are larger (28px vs 22px).
                isAlt && "lg:text-[28px] lg:leading-[28px]",
              )}
            >
              {category.stepTitle}
            </span>
            <span className="ml-auto flex items-center gap-1 text-selected text-brand">
              {/* Count: always shown when open; on collapsed steps it stays in
                  the single-column layout but hides once the two-column desktop
                  layout kicks in at lg, leaving just the chevron (§5). lg mirrors
                  the layout switch in page.tsx. */}
              <span className="inline lg:group-data-[state=closed]:hidden">
                {count} selected
              </span>
              {/* carrot-up points up (open); rotate 180° when the step is
                  closed so it points down. */}
              <Icon
                name="chevron"
                className="size-3 transition-transform group-data-[state=closed]:rotate-180 motion-reduce:transition-none"
              />
            </span>
          </span>
        </AccordionTrigger>
      </AccordionHeader>

      <AccordionContent className="px-[15px] pb-[20px]">
        <div
          className={cn(
            // Shared mobile/tablet grid (1-up → 2-up at sm).
            "grid grid-cols-1 gap-[15px] sm:grid-cols-2",
            isAlt
              ? // Alt desktop: one horizontal row of equal-width vertical cards.
                "lg:flex lg:gap-[15px]"
              : // Main desktop: 2-up grid, last odd card centred at half width.
                "sm:[&>*:last-child:nth-child(odd)]:col-span-2 sm:[&>*:last-child:nth-child(odd)]:w-[calc(50%-7.5px)] sm:[&>*:last-child:nth-child(odd)]:justify-self-center",
          )}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} variant={variant} />
          ))}
        </div>
        {nextStep && (
          <div className="mt-[15px] flex justify-center">
            <button
              type="button"
              onClick={() => onAdvance(nextStep.step)}
              className="cursor-pointer rounded-[7px] border border-brand px-6 py-[6.5px] text-next text-brand transition-colors hover:bg-brand hover:text-white"
            >
              Next: {nextStep.stepTitle}
            </button>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
