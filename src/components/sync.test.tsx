import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getBundle } from "@/lib/domain/bundle";
import { useBundleStore } from "@/lib/store/bundle-store";
import { ProductCard } from "./builder/ProductCard";
import { ReviewPanel } from "./review/ReviewPanel";

const camV4 = getBundle().products.find((p) => p.id === "cam-v4")!;

beforeEach(() => useBundleStore.getState().reset());

/**
 * The card stepper and the review line stepper are two views of the same store
 * line — editing either updates the other and the derived totals, with no syncing
 * code (they just both read/write `quantities`).
 */
describe("card ↔ review stepper sync", () => {
  it("keeps the card stepper, the review line, and the total in lockstep", async () => {
    const user = userEvent.setup();
    render(
      <>
        <div data-testid="card">
          <ProductCard product={camV4} />
        </div>
        <div data-testid="review">
          <ReviewPanel />
        </div>
      </>,
    );

    const card = screen.getByTestId("card");
    const review = screen.getByTestId("review");
    const cardStepper = within(card).getByRole("group", {
      name: "Wyze Cam v4 quantity",
    });
    const reviewStepper = within(review).getByRole("group", {
      name: "Wyze Cam v4 quantity",
    });

    // Seeded White = 1 on both surfaces; the review line total is 1 × $27.98.
    expect(cardStepper).toHaveTextContent("1");
    expect(reviewStepper).toHaveTextContent("1");
    expect(within(review).getByText("$27.98")).toBeInTheDocument();

    // Increment on the CARD → the review line and its total follow.
    await user.click(
      within(card).getByRole("button", {
        name: "Increase Wyze Cam v4 quantity",
      }),
    );
    expect(reviewStepper).toHaveTextContent("2");
    expect(within(review).getByText("$55.96")).toBeInTheDocument(); // 2 × 27.98

    // Decrement on the REVIEW → the card follows back.
    await user.click(
      within(review).getByRole("button", {
        name: "Decrease Wyze Cam v4 quantity",
      }),
    );
    expect(cardStepper).toHaveTextContent("1");
    expect(reviewStepper).toHaveTextContent("1");
  });
});
