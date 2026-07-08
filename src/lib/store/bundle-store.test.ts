import { describe, expect, it } from "vitest";
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
});
