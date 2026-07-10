import { afterEach, describe, expect, it, vi } from "vitest";
import { getBundle } from "@/lib/domain/bundle";
import { apiBundleSource } from "./bundle-source";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiBundleSource", () => {
  it("fetches /api/bundle and returns the validated catalog", async () => {
    const catalog = getBundle();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(catalog),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await apiBundleSource.load();

    expect(fetchMock).toHaveBeenCalledWith("/api/bundle");
    expect(result.products).toHaveLength(catalog.products.length);
    expect(result.categories).toHaveLength(catalog.categories.length);
  });

  it("throws on a non-ok response (no silent fallback to a bad payload)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Server Error",
        json: () => Promise.resolve({}),
      }),
    );

    await expect(apiBundleSource.load()).rejects.toThrow(/500/);
  });

  it("throws when the payload fails catalog validation", async () => {
    // Well-formed JSON, but not a valid catalog (empty steps, empty panel).
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ categories: [], products: [], panel: {} }),
      }),
    );

    await expect(apiBundleSource.load()).rejects.toThrow();
  });
});
