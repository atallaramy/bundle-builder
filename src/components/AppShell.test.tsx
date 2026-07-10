import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { apiBundleSource } from "@/lib/data/bundle-source";
import { getBundle } from "@/lib/domain/bundle";
import { useBundleStore } from "@/lib/store/bundle-store";
import { AppShell } from "./AppShell";

beforeEach(() => useBundleStore.getState().reset());
afterEach(() => vi.restoreAllMocks());

describe("AppShell", () => {
  it("revalidates the catalog from the data source on mount (SWR wiring)", async () => {
    // Stub the default source so the mount effect exercises the fetch path
    // without a real network call.
    const loadSpy = vi
      .spyOn(apiBundleSource, "load")
      .mockResolvedValue(getBundle());

    render(<AppShell variant="main" />);

    // The mount effect is wired to loadCatalog → the data source...
    await waitFor(() => expect(loadSpy).toHaveBeenCalled());
    // ...and revalidation lands, flipping the status off the seed.
    await waitFor(() =>
      expect(useBundleStore.getState().catalogStatus).toBe("live"),
    );
  });
});
