import { describe, expect, it, vi } from "vitest";
import { getBundle } from "@/lib/domain/bundle";
import { lineKey } from "@/lib/domain/selection";
import { createMemoryPersistence } from "@/lib/persistence/selection-persistence";
import { createBundleStore } from "./bundle-store";

function setup() {
  const persistence = createMemoryPersistence();
  let clock = 1000;
  const store = createBundleStore({
    persistence,
    now: () => (clock += 1),
  });
  return { store, persistence };
}

describe("bundle store", () => {
  it("seeds the initial selection and opens step 1", () => {
    const { store } = setup();
    expect(store.getState().openStep).toBe(1);
    expect(
      store.getState().selection.quantities[lineKey("cam-v4", "white")],
    ).toBe(1);
    expect(store.getState().savedAt).toBeNull();
  });

  it("increments, decrements, and clamps at zero (removing the entry)", () => {
    const { store } = setup();
    const key = lineKey("cam-v4", "black");

    store.getState().increment("cam-v4", "black");
    expect(store.getState().selection.quantities[key]).toBe(1);

    store.getState().decrement("cam-v4", "black");
    expect(store.getState().selection.quantities[key]).toBeUndefined();

    store.getState().decrement("cam-v4", "black"); // already 0 — stays 0
    expect(store.getState().selection.quantities[key]).toBeUndefined();
  });

  it("tracks per-variant quantities independently of the active variant", () => {
    const { store } = setup();
    store.getState().setQuantity("cam-v4", "white", 2);
    store.getState().setActiveVariant("cam-v4", "black");
    store.getState().increment("cam-v4", "black");

    expect(
      store.getState().selection.quantities[lineKey("cam-v4", "white")],
    ).toBe(2);
    expect(
      store.getState().selection.quantities[lineKey("cam-v4", "black")],
    ).toBe(1);
    expect(store.getState().selection.activeVariant["cam-v4"]).toBe("black");
  });

  it("save() persists and stamps savedAt; a fresh store restore()s it", () => {
    const { store, persistence } = setup();
    store.getState().setQuantity("duo-cam-doorbell", undefined, 3);
    store.getState().save();
    expect(store.getState().savedAt).not.toBeNull();

    const reopened = createBundleStore({ persistence });
    expect(
      reopened.getState().selection.quantities["duo-cam-doorbell"],
    ).toBeUndefined();
    reopened.getState().restore();
    expect(reopened.getState().selection.quantities["duo-cam-doorbell"]).toBe(
      3,
    );
  });

  it("restore() is a no-op when nothing is saved", () => {
    const { store } = setup();
    store.getState().restore();
    // still the seed
    expect(
      store.getState().selection.quantities[lineKey("cam-pan-v3", "white")],
    ).toBe(2);
  });

  it("reset() returns to the seed, reopens step 1, and clears persistence", () => {
    const { store, persistence } = setup();
    store.getState().setQuantity("cam-v4", "white", 9);
    store.getState().setOpenStep(4);
    store.getState().save();
    store.getState().reset();

    expect(
      store.getState().selection.quantities[lineKey("cam-v4", "white")],
    ).toBe(1);
    expect(store.getState().openStep).toBe(1);
    expect(store.getState().savedAt).toBeNull();
    // persistence is cleared, so a reopened store restores the seed, not the 9
    expect(persistence.load()).toBeNull();
    const reopened = createBundleStore({ persistence });
    reopened.getState().restore();
    expect(
      reopened.getState().selection.quantities[lineKey("cam-v4", "white")],
    ).toBe(1);
  });

  it("save() returns false and does not stamp savedAt when the write fails", () => {
    const failing = {
      save: () => false,
      load: () => null,
      clear: () => {},
    };
    const store = createBundleStore({ persistence: failing });
    const ok = store.getState().save();
    expect(ok).toBe(false);
    expect(store.getState().savedAt).toBeNull();
  });

  it("setQuantity ignores non-finite input (NaN/Infinity)", () => {
    const { store } = setup();
    store.getState().setQuantity("duo-cam-doorbell", undefined, Number.NaN);
    expect(
      store.getState().selection.quantities["duo-cam-doorbell"],
    ).toBeUndefined();
    store.getState().setQuantity("duo-cam-doorbell", undefined, Infinity);
    expect(
      store.getState().selection.quantities["duo-cam-doorbell"],
    ).toBeUndefined();
  });

  it("restore() normalizes an under-specified payload (backfills active variant, re-clamps required)", () => {
    const persistence = createMemoryPersistence();
    // A hand-editable payload: valid shape, but no active variant for cam-v4
    // and the required Sense Hub tampered to 5.
    persistence.save({
      quantities: { "cam-v4::white": 1, "sense-hub": 5 },
      activeVariant: {},
    });
    const store = createBundleStore({ persistence });
    store.getState().restore();

    expect(store.getState().selection.activeVariant["cam-v4"]).toBe("white");
    expect(store.getState().selection.quantities["sense-hub"]).toBe(1);
  });

  it("starts on the bundled seed (catalogStatus 'seed')", () => {
    const { store } = setup();
    expect(store.getState().catalogStatus).toBe("seed");
    expect(store.getState().bundle.panel.financing.months).toBe(12);
  });

  it("loadCatalog() swaps in the fetched catalog and marks it live", async () => {
    const fresh = structuredClone(getBundle());
    fresh.panel.financing.months = 24; // a detectable revalidation
    const store = createBundleStore({
      bundleSource: { load: () => Promise.resolve(fresh) },
      persistence: createMemoryPersistence(),
    });

    await store.getState().loadCatalog();

    expect(store.getState().catalogStatus).toBe("live");
    expect(store.getState().bundle.panel.financing.months).toBe(24);
  });

  it("loadCatalog() re-clamps the selection against the fresh catalog", async () => {
    const store = createBundleStore({
      bundleSource: { load: () => Promise.resolve(getBundle()) },
      persistence: createMemoryPersistence(),
    });
    // Tamper the required Sense Hub past its locked quantity via the raw setter.
    store.getState().setQuantity("sense-hub", undefined, 7);
    expect(store.getState().selection.quantities["sense-hub"]).toBe(7);

    await store.getState().loadCatalog();

    // normalizeSelection re-clamps required items to their locked qty (1).
    expect(store.getState().selection.quantities["sense-hub"]).toBe(1);
  });

  it("loadCatalog() prunes selection lines the fresh catalog no longer offers", async () => {
    // Fresh catalog with the MicroSD accessory removed (catalog drift).
    const fresh = structuredClone(getBundle());
    fresh.products = fresh.products.filter(
      (p) => p.id !== "microsd-card-256gb",
    );
    const store = createBundleStore({
      bundleSource: { load: () => Promise.resolve(fresh) },
      persistence: createMemoryPersistence(),
    });
    expect(store.getState().selection.quantities["microsd-card-256gb"]).toBe(2);

    await store.getState().loadCatalog();

    // The removed product's seeded line no longer lingers in the selection.
    expect(
      store.getState().selection.quantities["microsd-card-256gb"],
    ).toBeUndefined();
  });

  it("loadCatalog() keeps the seed and fails loud when the source throws", async () => {
    const store = createBundleStore({
      bundleSource: { load: () => Promise.reject(new Error("network down")) },
      persistence: createMemoryPersistence(),
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await store.getState().loadCatalog();

    expect(store.getState().catalogStatus).toBe("error");
    // Seed catalog + selection intact — the app stays fully usable.
    expect(store.getState().bundle.panel.financing.months).toBe(12);
    expect(
      store.getState().selection.quantities[lineKey("cam-v4", "white")],
    ).toBe(1);
    expect(errorSpy).toHaveBeenCalledOnce();
    errorSpy.mockRestore();
  });
});
