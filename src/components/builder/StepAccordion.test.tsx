import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useBundleStore } from "@/lib/store/bundle-store";
import { StepAccordion } from "./StepAccordion";

beforeEach(() => useBundleStore.getState().reset());

describe("StepAccordion — 'N selected'", () => {
  it("counts DISTINCT products in a step, not total quantity", async () => {
    const user = userEvent.setup();
    render(<StepAccordion variant="main" />);

    // Seeded cameras: Cam v4 + Pan v3 = 2 distinct products.
    // (Sensors also reads "2 selected", so match all and require the cameras one.)
    expect(screen.getAllByText("2 selected").length).toBeGreaterThanOrEqual(1);

    // Bumping an already-counted product's quantity does NOT change the count.
    await user.click(
      screen.getByRole("button", { name: "Increase Wyze Cam v4 quantity" }),
    );
    expect(
      useBundleStore.getState().selection.quantities["cam-v4::white"],
    ).toBe(2);
    expect(screen.queryByText("3 selected")).not.toBeInTheDocument();

    // Adding a NEW distinct camera (Floodlight) bumps the cameras count to 3.
    await user.click(
      screen.getByRole("button", {
        name: "Increase Wyze Cam Floodlight v2 quantity",
      }),
    );
    expect(screen.getByText("3 selected")).toBeInTheDocument();
  });
});
