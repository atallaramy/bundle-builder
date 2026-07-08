"use client";

import { useEffect } from "react";
import { StepAccordion } from "@/components/builder/StepAccordion";
import { ReviewPanel } from "@/components/review/ReviewPanel";
import { useBundleStore } from "@/lib/store/bundle-store";

/**
 * Two-column shell: the builder (768px) beside a sticky review panel (399px) on
 * desktop, stacking to a single column with a "Let's get started!" title on
 * phones (DESIGN-SPEC §1). A previously saved system is restored on mount; until
 * then the seeded configuration renders, so the first paint matches the design.
 */
export default function Home() {
  const restore = useBundleStore((s) => s.restore);
  useEffect(() => {
    restore();
  }, [restore]);

  return (
    <main className="min-h-full">
      <div className="mx-auto flex max-w-[1191px] flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start lg:justify-center lg:px-6 lg:py-10">
        <div className="w-full lg:w-[768px] lg:shrink-0">
          {/* Page title: the design shows it only on mobile, but it stays in the
              accessibility tree on desktop (sr-only) so the page always has an h1. */}
          <h1 className="mb-5 text-center text-page-title text-ink lg:sr-only">
            Let&apos;s get started!
          </h1>
          {/* Section heading for the builder column — keeps heading order
              h1 › h2 › h3(step) › h4(product) with no skips. */}
          <h2 className="sr-only">Build your system</h2>
          <StepAccordion />
        </div>
        <div className="w-full lg:sticky lg:top-6 lg:w-[399px] lg:shrink-0">
          <ReviewPanel />
        </div>
      </div>
    </main>
  );
}
