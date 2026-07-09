import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getBundle } from "@/lib/domain/bundle";
import { lineKey } from "@/lib/domain/selection";
import { useBundleStore } from "@/lib/store/bundle-store";
import { ProductCard } from "./ProductCard";

const bundle = getBundle();
const product = (id: string) => {
  const p = bundle.products.find((x) => x.id === id);
  if (!p) throw new Error(`no product ${id}`);
  return p;
};
const qtyOf = (productId: string, variantId?: string) =>
  useBundleStore.getState().selection.quantities[lineKey(productId, variantId)];

// The components read the singleton store, so reset it to the seed before each test.
beforeEach(() => useBundleStore.getState().reset());

describe("ProductCard", () => {
  it("renders the elements a product carries (badge, description, chips)", () => {
    render(<ProductCard product={product("cam-v4")} />);
    expect(
      screen.getByRole("heading", { name: "Wyze Cam v4" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/clearest Wyze Cam/)).toBeInTheDocument();
    expect(screen.getByText("Save 22%")).toBeInTheDocument();
    expect(screen.getByText("Learn More")).toBeInTheDocument();
    for (const label of ["White", "Grey", "Black"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("omits the elements a product lacks (doorbell: no badge, no variants)", () => {
    render(<ProductCard product={product("duo-cam-doorbell")} />);
    expect(screen.queryByText(/Save \d+%/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("radiogroup", { name: /colour/i }),
    ).not.toBeInTheDocument();
  });

  it("tracks a separate quantity per variant; the stepper binds to the active one", async () => {
    const user = userEvent.setup();
    render(<ProductCard product={product("cam-v4")} />);
    const stepper = screen.getByRole("group", { name: "Wyze Cam v4 quantity" });

    // Seeded: White = 1, and the stepper shows the active (White) count.
    expect(stepper).toHaveTextContent("1");

    await user.click(
      screen.getByRole("button", { name: "Increase Wyze Cam v4 quantity" }),
    );
    expect(stepper).toHaveTextContent("2");
    expect(qtyOf("cam-v4", "white")).toBe(2);

    // Select Black → the stepper rebinds to Black's count (0); White is untouched.
    await user.click(screen.getByText("Black"));
    expect(stepper).toHaveTextContent("0");
    expect(qtyOf("cam-v4", "white")).toBe(2);

    // Adding to Black leaves White's 2 intact — separate counts.
    await user.click(
      screen.getByRole("button", { name: "Increase Wyze Cam v4 quantity" }),
    );
    expect(qtyOf("cam-v4", "black")).toBe(1);
    expect(qtyOf("cam-v4", "white")).toBe(2);
  });

  it("locks the stepper for a Required product (Sense Hub)", () => {
    render(<ProductCard product={product("sense-hub")} />);
    expect(
      screen.getByRole("button", { name: /Increase Wyze Sense Hub/ }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Decrease Wyze Sense Hub/ }),
    ).toBeDisabled();
  });

  it("carries the selected border only while qty > 0", async () => {
    const user = userEvent.setup();
    // Doorbell starts at 0 → unselected.
    const { container } = render(
      <ProductCard product={product("duo-cam-doorbell")} />,
    );
    const article = within(container).getByRole("article");
    expect(article.className).not.toContain("shadow-[inset_0_0_0_2px");

    await user.click(
      screen.getByRole("button", {
        name: "Increase Wyze Duo Cam Doorbell quantity",
      }),
    );
    expect(article.className).toContain("shadow-[inset_0_0_0_2px");
  });
});
