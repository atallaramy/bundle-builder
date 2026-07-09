import { test, expect } from "@playwright/test";

/**
 * The end-to-end promise from the brief: configure a system, watch the review
 * update live, save it, leave, come back — and find it exactly as left.
 * Runs at both the desktop and phone viewports (see playwright.config projects).
 */
test("build → live totals → save → reload → restored", async ({ page }) => {
  await page.goto("/");

  const review = page.getByRole("complementary", {
    name: "Your security system",
  });

  // Seeded grand total (card-canonical pricing; see README/DISCUSSIONS).
  await expect(review.getByText("$209.87")).toBeVisible();

  // Add one Wyze Cam v4 on its CARD (scope to the card, since the review line
  // carries an identically-labelled stepper).
  const card = page.locator("article").filter({ hasText: "Wyze Cam v4" });
  await card
    .getByRole("button", { name: "Increase Wyze Cam v4 quantity" })
    .click();

  // The review line and the grand total update live: +$27.98 → $237.85.
  const reviewLine = review.getByRole("group", {
    name: "Wyze Cam v4 quantity",
  });
  await expect(reviewLine).toContainText("2");
  await expect(review.getByText("$237.85")).toBeVisible();

  // Save the system.
  await page.getByRole("button", { name: "Save my system for later" }).click();
  await expect(
    page.getByRole("button", { name: /Saved for later/ }),
  ).toBeVisible();

  // Come back (reload) — the configuration is restored, not reset to the seed.
  await page.reload();
  await expect(review.getByText("$237.85")).toBeVisible();
  await expect(review.getByText("$209.87")).toHaveCount(0);
  await expect(
    review.getByRole("group", { name: "Wyze Cam v4 quantity" }),
  ).toContainText("2");
});
