import { AppShell } from "@/components/AppShell";

/**
 * `/alt` — the alternate single-column layout (full-width builder with cards in
 * a row, above a two-column review). Same components + store as `/`; only the
 * desktop arrangement differs (mobile is identical).
 */
export default function Alt() {
  return <AppShell variant="alt" />;
}
