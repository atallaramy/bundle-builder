"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";
import type { LayoutVariant } from "@/lib/layout";
import { useStickyBottom } from "@/lib/use-sticky-bottom";
import { useBundleStore } from "@/lib/store/bundle-store";
import { StepAccordion } from "@/components/builder/StepAccordion";
import { ReviewPanel } from "@/components/review/ReviewPanel";

/**
 * The page shell for both routes. The `variant` (from each route's page) picks
 * the desktop arrangement and is threaded into the shared builder/review
 * components; the mobile layout is identical either way.
 * - `main` (`/`)    — two columns: 768px builder beside a sticky 399px review.
 * - `alt`  (`/alt`) — one column: full-width builder above the review.
 *
 * A previously saved system is restored on mount; until then the seeded
 * configuration renders, so the first paint matches the design.
 */
export function AppShell({ variant }: { variant: LayoutVariant }) {
  const restore = useBundleStore((s) => s.restore);
  useEffect(() => {
    restore();
  }, [restore]);

  const isAlt = variant === "alt";
  // Two-column review is sticky and can outgrow the viewport; follow the scroll
  // to its bottom instead of pinning it to the top. Inert in the alt (stacked)
  // layout, where the review isn't sticky.
  const { ref: reviewRef, top: reviewTop } = useStickyBottom();

  return (
    <main className="min-h-full">
      <div
        className={cn(
          "mx-auto flex flex-col gap-6 px-4 py-6 lg:px-6 lg:py-10",
          isAlt
            ? // One column: builder on top, review below.
              "max-w-[1213px] lg:gap-10"
            : // Two columns: builder beside the review, centred.
              "max-w-[1191px] lg:flex-row lg:items-start lg:justify-center",
        )}
      >
        <div className={cn("w-full", !isAlt && "lg:w-[768px] lg:shrink-0")}>
          {/* Page title: the design shows it only on mobile, but it stays in the
              accessibility tree on desktop (sr-only) so the page always has an h1. */}
          <h1 className="mb-5 text-center text-page-title text-ink-soft lg:sr-only">
            Let&apos;s get started!
          </h1>
          {/* Section heading for the builder column — keeps heading order
              h1 › h2 › h3(step) › h4(product) with no skips. */}
          <h2 className="sr-only">Build your system</h2>
          <StepAccordion variant={variant} />
        </div>
        <div
          ref={isAlt ? undefined : reviewRef}
          className={cn(
            // Mobile: the review panel is full-bleed (edge to edge), matching the
            // Figma phone frame — cancel the page's px-4 gutter so its content
            // width isn't double-inset. Desktop keeps the columned width.
            "w-full max-lg:-mx-4 max-lg:w-[calc(100%+2rem)]",
            !isAlt && "lg:sticky lg:w-[399px] lg:shrink-0",
          )}
          // `top` is applied only where the panel is sticky (lg + two-column);
          // it's inert while the element is statically positioned (mobile/alt).
          style={isAlt ? undefined : { top: reviewTop }}
        >
          <ReviewPanel variant={variant} />
        </div>
      </div>
    </main>
  );
}
