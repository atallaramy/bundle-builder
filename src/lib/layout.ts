/**
 * The two desktop layouts the app ships, one per route:
 * - `main` (`/`)     — two columns: builder beside a sticky review.
 * - `alt`  (`/alt`)  — one column: full-width builder (cards in a row) above a
 *                      two-column review.
 *
 * Both share the identical mobile layout; the variant only switches the `lg:`
 * (desktop) arrangement. Threaded as an explicit prop from each route's page
 * into the shared builder/review components (no route-sniffing, no globals).
 */
export type LayoutVariant = "main" | "alt";
