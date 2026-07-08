import { describe, expect, it } from "vitest";
import { getBundle } from "./bundle";
import { lineKey, seedSelection } from "./selection";

const bundle = getBundle();

describe("lineKey", () => {
  it("composes product + variant, and keys unvariated products by id alone", () => {
    expect(lineKey("cam-v4", "white")).toBe("cam-v4::white");
    expect(lineKey("sense-hub")).toBe("sense-hub");
  });
});

describe("seedSelection", () => {
  const seed = seedSelection(bundle);

  it("seeds exactly the design's initial quantities", () => {
    expect(seed.quantities).toEqual({
      "cam-v4::white": 1,
      "cam-pan-v3::white": 2,
      "sense-motion-sensor": 2,
      "sense-hub": 1,
      "microsd-card-256gb": 2,
      "cam-unlimited": 1,
    });
  });

  it("does not seed unselected products or unselected variants", () => {
    expect(seed.quantities["cam-v4::black"]).toBeUndefined();
    expect(seed.quantities["cam-floodlight-v2::white"]).toBeUndefined();
    expect(seed.quantities["duo-cam-doorbell"]).toBeUndefined();
    expect(seed.quantities["battery-cam-pro::white"]).toBeUndefined();
  });

  it("makes the seeded variant active, else the first variant", () => {
    expect(seed.activeVariant["cam-v4"]).toBe("white"); // seeded
    expect(seed.activeVariant["cam-pan-v3"]).toBe("white"); // seeded
    expect(seed.activeVariant["cam-floodlight-v2"]).toBe("white"); // first
    expect(seed.activeVariant["battery-cam-pro"]).toBe("white"); // first
  });

  it("assigns no active variant to unvariated products", () => {
    expect(seed.activeVariant["sense-hub"]).toBeUndefined();
    expect(seed.activeVariant["cam-unlimited"]).toBeUndefined();
  });
});
