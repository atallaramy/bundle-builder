# Bundle Builder

A two-column, multi-step **bundle builder** with a **live review panel**. A shopper
assembles a home-security system through a 4-step accordion (Cameras → Plan →
Sensors → Add extra protection); the review panel beside it updates live —
category-grouped line items, quantity steppers kept in sync with the cards,
totals with savings, and **"Save my system for later"** (localStorage). Built as a
production-quality, client-side React app.

## Live demo

Deployed on Vercel — click to open:

- **[Main layout — `/`](https://ecomexperts-io-ramy.vercel.app/)** — the canonical
  two-column builder beside the live review.
- **[Alternate layout — `/alt`](https://ecomexperts-io-ramy.vercel.app/alt)** — the
  single-column variant (same components + store).
- **[Catalog API — `/api/bundle`](https://ecomexperts-io-ramy.vercel.app/api/bundle)** —
  the JSON the app fetches at runtime.

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
    AppShell.tsx  # layout shell — two-column (/) vs single-column (/alt)
    ui/           # primitives (accordion, price, icons) themed to tokens
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
  then revalidated from `/api/bundle` (stale-while-revalidate; a fetch failure keeps
  the seed and fails loud in dev) via a swappable `BundleSource` interface — the same
  Adapter/DIP seam as persistence.
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

Design-fidelity calls made against the Figma:

- **Fonts.** Gilroy + TT Norms Pro are licensed, so this build substitutes
  **Manrope** — the closest free geometric-humanist match (it renders a touch wider).
- **Pan v3 pricing.** The mock's card and review prices conflict — took the card
  price as canonical and recomputed the totals.
- **Steps 2–4.** The Figma fully designs only the Cameras step; Plan, Sensors, and
  Accessories extend the same card pattern through the shared data-driven components.
- **Plan line has no stepper** — per the design (the Required Sense Hub keeps its
  stepper, but disabled).
- **Stepper position.** The Figma is inconsistent — on `/` each stepper sits under its
  card's description; on `/alt` they're all aligned to one shared line. Kept the `/`
  behaviour (under each card's content) in both, rather than build two.
- **Stepper button styling.** The Figma's +/− buttons fluctuate card-to-card
  (fill/no-fill, border/no-border); standardised into consistent active / at-minimum /
  locked states rather than copy each one-off.
- **Two desktop layouts.** `/` and `/alt` are the two desktop frames — the same
  components + store, switched by a `variant` prop (no route-sniffing).
- **Mobile is responsive, not pixel-matched** (per the brief) — panels go full-bleed;
  long product names may wrap.
- **One Figma card** sits at a smaller type size than its four row-mates in the mock —
  kept the row uniform rather than reproduce the slip.

## Not included (scope)

- No backend beyond the single `/api/bundle` route (the bonus — consumed at runtime,
  see _Data-driven_ above); no auth, PII, or secrets — client-side prototype.
- No dark mode, i18n, or animation beyond the accordion open/close and a subtle
  grand-total tick.

## Testing

The full pyramid:

- **Unit** (`lib/domain`) — pricing in integer cents, per-variant quantity
  separation, selection counts, savings.
- **Component / integration** (Testing Library driving the store) — card ↔ review
  stepper sync, variant separation, "N selected" (distinct products), Required
  stepper locked, plan line has no stepper, save writes localStorage.
- **E2E** (Playwright) — build a system → totals update → save → reload →
  restored, run at both a desktop and a phone viewport.
