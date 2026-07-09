import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Unmount rendered trees between tests so the shared singleton store isn't read
// by stale components.
afterEach(() => cleanup());

// jsdom lacks a couple of browser APIs the components touch (the sticky-panel
// hook's ResizeObserver, Radix/media queries). Stub them so component tests can
// render without pulling in a real browser.
if (!("ResizeObserver" in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
  });
}
