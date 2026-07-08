"use client";

import { cn } from "@/lib/cn";
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
export function StepAccordion() {
  const openStep = useBundleStore((s) => s.openStep);
  const setOpenStep = useBundleStore((s) => s.setOpenStep);

  return (
    <Accordion
      type="single"
      collapsible
      // Radix speaks strings; map to/from our numeric step ("" = all closed).
      value={openStep != null ? String(openStep) : ""}
      onValueChange={(value) => setOpenStep(value ? Number(value) : null)}
      className="flex flex-col"
    >
      {steps.map((category) => (
        <Step key={category.id} category={category} onAdvance={setOpenStep} />
      ))}
    </Accordion>
  );
}

function Step({
  category,
  onAdvance,
}: {
  category: Category;
  onAdvance: (step: number) => void;
}) {
  const counts = useSelectedCounts();
  const count = counts[category.id];
  const products = bundle.products.filter((p) => p.category === category.id);
  const nextStep = steps.find((c) => c.step === category.step + 1);

  return (
    <AccordionItem
      value={String(category.step)}
      className={cn(
        "border-line",
        // Collapsed steps: hairline-divided list rows (with a trailing rule).
        "data-[state=closed]:border-t last:data-[state=closed]:border-b",
        // Open step: tinted rounded panel with 13px breathing room around it.
        "data-[state=open]:my-[13px] data-[state=open]:rounded-card data-[state=open]:border data-[state=open]:border-line-soft data-[state=open]:bg-panel",
        "first:mt-0",
      )}
    >
      <AccordionHeader>
        <AccordionTrigger className="group flex w-full cursor-pointer flex-col gap-2 px-[15px] py-[15px] text-left">
          <span className="text-eyebrow text-muted uppercase">
            Step {category.step} of {TOTAL_STEPS}
          </span>
          <span className="flex w-full items-center gap-2.5">
            <Icon name={category.icon} className="size-6 shrink-0 text-ink" />
            <span className="text-section text-ink">{category.stepTitle}</span>
            <span className="ml-auto flex items-center gap-1.5 text-selected text-brand">
              {/* Count: always shown when open; on collapsed steps it stays in
                  the single-column layout but hides once the two-column desktop
                  layout kicks in at lg, leaving just the chevron (§5). lg mirrors
                  the layout switch in page.tsx. */}
              <span className="inline lg:group-data-[state=closed]:hidden">
                {count} selected
              </span>
              <Icon
                name="chevron"
                className="size-4 transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none"
              />
            </span>
          </span>
        </AccordionTrigger>
      </AccordionHeader>

      <AccordionContent className="px-[15px] pb-[15px]">
        <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {nextStep && (
          <div className="mt-[13px] flex justify-center">
            <button
              type="button"
              onClick={() => onAdvance(nextStep.step)}
              className="cursor-pointer rounded-control border border-brand px-6 py-2.5 text-next text-brand transition-colors hover:bg-brand hover:text-white"
            >
              Next: {nextStep.stepTitle}
            </button>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
