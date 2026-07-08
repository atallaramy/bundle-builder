import { beforeEach, describe, expect, it } from "vitest";
import type { Selection } from "@/lib/domain/selection";
import {
  localStoragePersistence,
  parseSelection,
} from "./selection-persistence";

describe("parseSelection (untrusted payload)", () => {
  it("accepts a well-formed payload", () => {
    const selection: Selection = {
      quantities: { "cam-v4::white": 2 },
      activeVariant: { "cam-v4": "white" },
    };
    expect(parseSelection({ version: 1, selection })).toEqual(selection);
  });

  it("rejects wrong version, wrong shape, and bad value types", () => {
    expect(parseSelection(null)).toBeNull();
    expect(parseSelection("nope")).toBeNull();
    expect(parseSelection({ version: 2, selection: null })).toBeNull();
    expect(parseSelection({ version: 1 })).toBeNull();
    // negative / non-integer / non-number quantities
    expect(
      parseSelection({
        version: 1,
        selection: { quantities: { a: -1 }, activeVariant: {} },
      }),
    ).toBeNull();
    expect(
      parseSelection({
        version: 1,
        selection: { quantities: { a: 1.5 }, activeVariant: {} },
      }),
    ).toBeNull();
    expect(
      parseSelection({
        version: 1,
        selection: { quantities: { a: "x" }, activeVariant: {} },
      }),
    ).toBeNull();
    // non-string active variant
    expect(
      parseSelection({
        version: 1,
        selection: { quantities: {}, activeVariant: { a: 3 } },
      }),
    ).toBeNull();
  });
});

describe("localStoragePersistence", () => {
  beforeEach(() => window.localStorage.clear());

  it("round-trips a selection", () => {
    const selection: Selection = {
      quantities: { "cam-v4::white": 1 },
      activeVariant: { "cam-v4": "white" },
    };
    expect(localStoragePersistence.save(selection)).toBe(true);
    expect(localStoragePersistence.load()).toEqual(selection);
  });

  it("returns null when nothing is saved", () => {
    expect(localStoragePersistence.load()).toBeNull();
  });

  it("returns null (never throws) on corrupt data", () => {
    window.localStorage.setItem("bundle-builder:v1", "{ not json");
    expect(localStoragePersistence.load()).toBeNull();
  });

  it("clear() removes the saved selection", () => {
    localStoragePersistence.save({ quantities: {}, activeVariant: {} });
    localStoragePersistence.clear();
    expect(localStoragePersistence.load()).toBeNull();
  });
});
