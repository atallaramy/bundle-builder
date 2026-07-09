import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config. Tests live in `e2e/` (kept out of `src/**` so vitest never picks
 * them up, and Playwright never runs the component tests). Runs the flow at both
 * a desktop and a phone viewport — the app is one responsive build, so the same
 * spec must pass on both. Reuses an already-running dev server if there is one.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"] },
    },
  ],
});
