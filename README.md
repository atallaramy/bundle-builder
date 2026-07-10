# Bundle Builder

A two-column, multi-step **bundle builder** with a **live review panel**. A shopper
assembles a home-security system through a 4-step accordion (Cameras → Plan →
Sensors → Add extra protection); the review panel beside it updates live —
category-grouped line items, quantity steppers kept in sync with the cards,
totals with savings, and **"Save my system for later"** (localStorage). Built as a
production-quality, client-side React app.

## Run it

Prerequisites: **Node 20+** (developed on 22).

```bash
npm install
npm run dev        # → http://localhost:3000
```

It builds and runs from a clean clone. Two desktop layouts ship, both from the
same components + store and collapsing to one shared mobile layout:

- **`/`** — the canonical two-column layout (768px builder beside a sticky review).
- **`/alt`** — the alternate single-column layout (full-width builder with cards in
  a row, above a two-column review).

Other scripts:

```bash
npm run build      # production build
npm run check      # format:check + lint (type-aware) + typecheck — the pre-commit gate
npm test           # unit + component/integration (vitest + Testing Library)
npm run test:e2e   # end-to-end (Playwright, desktop + phone)
```

## Stack

Next.js (App Router, **client-side only**) · TypeScript · Tailwind v4 · Radix
primitives (accessibility floor) · Zustand (+ `persist`) · **Manrope** · vitest +
Testing Library · Playwright.

## Architecture

```
src/
  app/            # page shells (/ and /alt), layout, /api/bundle route
  components/
    ui/           # primitives (accordion, radio group, price, icons) themed to tokens
    builder/      # StepAccordion, ProductCard, VariantSelector, QtyStepper
    review/       # ReviewPanel, LineItem, Totals, Checkout
  lib/
    domain/       # PURE logic: pricing (integer cents), variant-qty, counts — framework-free
    store/         # Zustand store (single source of truth) + derived-state hooks
    persistence/   # localStorage adapter behind an interface (validated payload)
    data/          # catalog source adapter (seed + /api/bundle fetch) behind an interface
  data/bundle.json # all products, categories, panel config (served by /api/bundle)
```

Principles the feature actually earns:

- **Single source of truth** — the Zustand store holds only the raw selection;
  every count/total/line is **derived** (never stored). The card stepper and the
  review line read/write the same store line, so they stay in sync with no
  syncing code.
- **Data-driven** — components render from the catalog; adding a product/variant is a
  data change, not new markup. State is **seeded** so first paint matches the design,
  then the catalog is revalidated from `/api/bundle` (see _Catalog data path_ below).
- **Pure domain layer** — money math and per-variant quantity logic are pure,
  hard-unit-tested functions.
- **Persistence behind an interface** — localStorage is one implementation; the
  saved payload is validated/normalized on load, never trusted blindly.
- **Tokens, not raw values** — colors/radii/type live in `globals.css @theme`.

## Key interactions

- **Per-variant quantities** — red and blue of the same product are tracked
  separately; the card stepper binds to the **active** variant, and the review
  shows every variant with qty > 0 as its own line.
- **"N selected"** — the number of **distinct products** chosen in a step.
- **Live review** — totals recalculate as quantities change.
- **Persistence** — configure → _Save my system for later_ → reload/return → it's
  restored exactly.

## Decisions & tradeoffs

- **Catalog data path (stale-while-revalidate).** First paint uses the bundled
  `bundle.json` seed, so there's no loading flash over the pixel-matched design; on
  mount the store's `loadCatalog` fetches `/api/bundle`, validates the payload, and
  revalidates the catalog — exercising the real frontend↔backend path (plus loading
  and error handling) without a spinner. The catalog lives in the store (the cart
  derivations need catalog + selection together) behind a swappable `BundleSource`
  interface — the same Adapter/DIP seam as persistence, so the source can move from
  the bonus API to a real backend without touching consumers. A fetch failure falls
  back to the seed and fails loud in dev; the app stays fully usable.
- **Fonts.** The design uses Gilroy + TT Norms Pro (licensed); this build
  substitutes **Manrope**, the closest free geometric-humanist match. Manrope
  renders a touch wider than Gilroy, which accounts for the only real pixel
  deltas: two long product names wrap on mobile, and a couple of shrink-wrapped
  prices/steppers sit a few px off. Accepted as font-metric.
- **Pan v3 pricing.** The Figma's Pan v3 card and review prices are mutually
  inconsistent. This build treats the **card price as canonical**
  (`$34.98` / compare `$39.98`) with honest recalculating math → seeded grand
  total **$209.87** (compare `$260.79`, savings `$50.92`). That intentionally
  differs from the mock's self-inconsistent `$187.89`.
- **Steps 2–4.** The Figma only fully designs the Cameras step; the plan, sensors,
  and accessories appear only as pre-populated review lines. Their card styling is
  a consistent extension of the Cameras pattern via the same data-driven
  components (variants only where a product has them).
- **Plan review line has no stepper** — shield · two-tone name · struck `/mo`
  price. It's the one line without a stepper, per the design (the Required Sense
  Hub keeps its stepper, but disabled).
- **Two desktop layouts.** `/` and `/alt` are the two desktop frames in the
  design; both are the same components + store parameterized by a `variant` prop
  (no route-sniffing), sharing one responsive mobile layout.
- **Mobile is responsive, not pixel-matched** (as the brief specifies). Panels go
  full-bleed to match the phone frame; long product names may wrap.
- **One Figma card** is left at a smaller type size in the mock (the other four in
  its row are larger) — kept the row uniform rather than reproduce the slip. The
  fidelity work was measured against the design frame-by-frame; see the
  `fix(fidelity): …` commit history.

## Not included (scope)

- No backend beyond the single `/api/bundle` route (the bonus, now consumed at
  runtime — see _Catalog data path_ above); no auth, PII, or secrets — client-side
  prototype.
- No dark mode, i18n, or animation beyond the accordion open/close.
- Not deployed (a later step).

## Testing

The full pyramid:

- **Unit** (`lib/domain`) — pricing in integer cents, per-variant quantity
  separation, selection counts, savings.
- **Component / integration** (Testing Library driving the store) — card ↔ review
  stepper sync, variant separation, "N selected" (distinct products), Required
  stepper locked, plan line has no stepper, save writes localStorage.
- **E2E** (Playwright) — build a system → totals update → save → reload →
  restored, run at both a desktop and a phone viewport.
