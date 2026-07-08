/**
 * Typed accessor for the design tokens whose raw values live in
 * `src/app/globals.css` (@theme). Each entry references the same CSS custom
 * property Tailwind generates its utilities from, so utility classes and
 * JS/inline-style consumers always read one source of truth (DESIGN-SPEC §2–4).
 *
 * Prefer Tailwind utilities in markup (`bg-brand`, `text-danger`,
 * `rounded-card`, `text-section`). Reach for these constants only where a value
 * must cross into JS — an inline style, a CVA compound, a canvas/chart color.
 */

export const color = {
  brand: "var(--color-brand)",
  ink: "var(--color-ink)",
  inkSoft: "var(--color-ink-soft)",
  muted: "var(--color-muted)",
  inkPrice: "var(--color-ink-price)",
  label: "var(--color-label)",
  subhead: "var(--color-subhead)",
  danger: "var(--color-danger)",
  success: "var(--color-success)",
  link: "var(--color-link)",
  panel: "var(--color-panel)",
  panelAlt: "var(--color-panel-alt)",
  card: "var(--color-card)",
  line: "var(--color-line)",
  lineSoft: "var(--color-line-soft)",
  chip: "var(--color-chip)",
} as const;

export type ColorToken = keyof typeof color;

export const radius = {
  card: "var(--radius-card)",
  control: "var(--radius-control)",
  xs: "var(--radius-xs)",
} as const;

export type RadiusToken = keyof typeof radius;

/**
 * Layout geometry from DESIGN-SPEC §1 (desktop 1440-wide frame). Numbers, since
 * they're used in TS for container sizing and document the two-column ratio.
 * Values are px.
 */
export const layout = {
  builderWidth: 768, // left column (builder)
  reviewWidth: 399, // right column (review panel, sticky)
  columnGap: 24, // gap between the two columns (approx)
  stepGap: 13, // vertical gap between accordion steps
  twoColumnMinWidth: 1024, // ≥ this width → two columns; below → stacked
} as const;
