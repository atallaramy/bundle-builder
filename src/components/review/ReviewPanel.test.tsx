import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { useBundleStore } from "@/lib/store/bundle-store";
import { ReviewPanel } from "./ReviewPanel";

beforeEach(() => useBundleStore.getState().reset());

describe("ReviewPanel", () => {
  it("groups the seeded selection under category subheads", () => {
    render(<ReviewPanel />);
    // Rendered text is the label; the caps are CSS (text-transform: uppercase).
    for (const subhead of ["Cameras", "Sensors", "Accessories", "Plan"]) {
      expect(screen.getByText(subhead)).toBeInTheDocument();
    }
    expect(screen.getByText("Wyze Cam v4")).toBeInTheDocument();
    expect(screen.getByText("Wyze Sense Motion Sensor")).toBeInTheDocument();
    expect(screen.getByText("Wyze MicroSD Card (256GB)")).toBeInTheDocument();
  });

  it("shows line totals as unit × quantity", () => {
    render(<ReviewPanel />);
    // Pan v3 seeded ×2 → 34.98×2 = $69.96 (compare 39.98×2 = $79.96).
    expect(screen.getByText("$69.96")).toBeInTheDocument();
    expect(screen.getByText("$79.96")).toBeInTheDocument();
    // MicroSD seeded ×2 → 20.98×2 = $41.96.
    expect(screen.getByText("$41.96")).toBeInTheDocument();
  });

  it("renders the plan line with no stepper and a two-tone /mo price", () => {
    render(<ReviewPanel />);
    expect(
      screen.queryByRole("group", { name: /Cam Unlimited quantity/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Cam")).toBeInTheDocument();
    expect(screen.getByText("Unlimited")).toBeInTheDocument();
    expect(screen.getByText("$9.99/mo")).toBeInTheDocument();
    expect(screen.getByText("$12.99/mo")).toBeInTheDocument();
  });

  it("marks the Required line FREE with a locked stepper", () => {
    render(<ReviewPanel />);
    expect(screen.getByText(/Wyze Sense Hub \(Required\)/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Increase Wyze Sense Hub/ }),
    ).toBeDisabled();
    // FREE appears for both the Sense Hub and the Fast Shipping rows.
    expect(screen.getAllByText("FREE").length).toBeGreaterThanOrEqual(2);
  });

  it("renders Fast Shipping as the last line group (struck $5.99 → FREE)", () => {
    render(<ReviewPanel />);
    expect(screen.getByText("Fast Shipping")).toBeInTheDocument();
    expect(screen.getByText("$5.99")).toBeInTheDocument();
  });

  it("shows the grand total, struck compare-at, and savings callout", () => {
    render(<ReviewPanel />);
    expect(screen.getByText("$209.87")).toBeInTheDocument();
    expect(screen.getByText("$260.79")).toBeInTheDocument();
    expect(screen.getByText(/saving \$50\.92/)).toBeInTheDocument();
  });
});
