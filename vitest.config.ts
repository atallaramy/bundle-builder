import { defineConfig } from "vitest/config";

// jsdom so the same config serves pure-domain tests now and component/store
// tests (which need localStorage + DOM) later. `resolve.tsconfigPaths` resolves
// the `@/*` alias natively (Vite built-in — no extra plugin). Tests are
// colocated as `*.test.ts(x)` beside the code they cover.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    // jest-dom matchers + cleanup + jsdom API stubs for the component tests.
    setupFiles: ["./vitest.setup.ts"],
  },
});
