"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import type { ComponentPropsWithoutRef } from "react";

/**
 * Thin, token-styled wrappers over Radix Accordion — our "a11y floor": Radix
 * owns keyboard nav, `aria-expanded`/`aria-controls` wiring, focus management,
 * and the single-open logic; we own the look. This is the manual stand-in for
 * what `shadcn add accordion` would generate, kept minimal so the app-specific
 * open/closed treatment lives in `StepAccordion`.
 *
 * `data-slot="accordion-content"` is the hook the open/close animation in
 * `globals.css` targets (via `--radix-accordion-content-height`).
 */

export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={className}
      {...props}
    />
  );
}

export function AccordionHeader({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof AccordionPrimitive.Header>) {
  return (
    <AccordionPrimitive.Header
      data-slot="accordion-header"
      className={className}
      {...props}
    />
  );
}

export function AccordionTrigger({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Trigger
      data-slot="accordion-trigger"
      className={className}
      {...props}
    />
  );
}

export function AccordionContent({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>) {
  // Height animates on this element (overflow-hidden via the data-slot rule);
  // the inner wrapper carries padding so it doesn't jump during the reveal.
  return (
    <AccordionPrimitive.Content data-slot="accordion-content" {...props}>
      <div className={className}>{children}</div>
    </AccordionPrimitive.Content>
  );
}
