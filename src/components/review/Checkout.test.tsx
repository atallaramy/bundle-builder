import { act } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useBundleStore } from "@/lib/store/bundle-store";
import { Checkout } from "./Checkout";

const STORAGE_KEY = "bundle-builder:v1";

beforeEach(() => useBundleStore.getState().reset());

describe("Checkout — save & confirm", () => {
  it("writes the system to localStorage and confirms only on a real save", async () => {
    const user = userEvent.setup();
    render(<Checkout />);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();

    await user.click(
      screen.getByRole("button", { name: "Save my system for later" }),
    );
    expect(
      screen.getByRole("button", { name: /Saved for later/ }),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem(STORAGE_KEY)).toContain("cam-v4");
  });

  it("reverts the 'Saved' label once the selection changes again", async () => {
    const user = userEvent.setup();
    render(<Checkout />);
    await user.click(
      screen.getByRole("button", { name: "Save my system for later" }),
    );
    expect(
      screen.getByRole("button", { name: /Saved for later/ }),
    ).toBeInTheDocument();

    // Any edit swaps in a new selection reference, so the stale "Saved" clears.
    act(() => useBundleStore.getState().increment("cam-v4", "white"));
    expect(
      screen.getByRole("button", { name: "Save my system for later" }),
    ).toBeInTheDocument();
  });

  it("shows a placeholder confirmation on Checkout", async () => {
    const user = userEvent.setup();
    render(<Checkout />);
    await user.click(screen.getByRole("button", { name: "Checkout" }));
    expect(screen.getByText(/demo/i)).toBeInTheDocument();
  });
});
