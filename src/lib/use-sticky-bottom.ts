"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Bottom-follow sticky offset for a panel that can be taller than the viewport.
 *
 * Plain `position: sticky; top: X` pins a panel to the top of the viewport — fine
 * when the panel fits, but if it's taller than the viewport its lower content
 * (here: the totals, Checkout, and "Save for later") never scrolls into view
 * until the whole page bottom is reached, which reads as the panel "hanging" out
 * of sync with the column beside it.
 *
 * This computes the `top` a sticky panel needs so that instead it *follows* the
 * scroll to its bottom:
 *  - panel fits (panelH + gaps ≤ viewportH) → `topGap`: classic top-stick.
 *  - panel taller than the viewport → `viewportH - panelH - bottomGap` (often
 *    negative): the panel rises with the page until its bottom meets the viewport
 *    bottom, then pins there while the column beside it keeps scrolling. Scrolling
 *    back up releases it, so the top is always reachable too.
 *
 * `min(...)` picks whichever offset applies. Recomputed only when the panel or the
 * viewport resizes (via ResizeObserver + a resize listener) — scrolling itself is
 * handled entirely by CSS `position: sticky`, so there's no scroll handler and no
 * per-frame work. Matches the behaviour of `react-sticky-box` without the dep.
 *
 * The initial value is `topGap`, so the first paint (before measurement) is the
 * plain top-stick the design already expects.
 */
export function useStickyBottom<T extends HTMLElement = HTMLDivElement>(
  topGap = 24,
  bottomGap = 24,
) {
  const ref = useRef<T>(null);
  const [top, setTop] = useState(topGap);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const recompute = () => {
      setTop(
        Math.min(topGap, window.innerHeight - el.offsetHeight - bottomGap),
      );
    };

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(el);
    window.addEventListener("resize", recompute);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, [topGap, bottomGap]);

  return { ref, top };
}
