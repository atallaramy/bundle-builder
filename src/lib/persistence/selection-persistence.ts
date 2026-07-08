import { isRecord } from "@/lib/domain/guards";
import type { Selection } from "@/lib/domain/selection";

/**
 * Persistence for the shopper's saved system, kept behind an interface so the
 * storage mechanism is swappable (localStorage here; an in-memory impl for
 * tests) and the store depends on the abstraction, not the browser API.
 */
export interface SelectionPersistence {
  /** Persist the selection. Returns whether it was actually written, so a
   *  swallowed storage error is never reported to the caller as success. */
  save(selection: Selection): boolean;
  load(): Selection | null;
  clear(): void;
}

const STORAGE_KEY = "bundle-builder:v1";
const SCHEMA_VERSION = 1;

interface StoredPayload {
  version: typeof SCHEMA_VERSION;
  selection: Selection;
}

const isDev = process.env.NODE_ENV !== "production";

function isRecordOfNonNegInt(value: unknown): value is Record<string, number> {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (n) => typeof n === "number" && Number.isInteger(n) && n >= 0,
    )
  );
}

function isRecordOfString(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) && Object.values(value).every((s) => typeof s === "string")
  );
}

/**
 * Validate an untrusted payload (from localStorage) into a Selection, or null
 * if it's the wrong version/shape. Never trust persisted data blindly — a
 * corrupt or stale payload falls back to the seed rather than corrupting state.
 */
export function parseSelection(raw: unknown): Selection | null {
  if (!isRecord(raw)) return null;
  if (raw.version !== SCHEMA_VERSION) return null;
  if (!isRecord(raw.selection)) return null;

  const { quantities, activeVariant } = raw.selection;
  if (!isRecordOfNonNegInt(quantities)) return null;
  if (!isRecordOfString(activeVariant)) return null;

  return { quantities, activeVariant };
}

export const localStoragePersistence: SelectionPersistence = {
  save(selection) {
    if (typeof window === "undefined") return false;
    try {
      const payload: StoredPayload = { version: SCHEMA_VERSION, selection };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (err) {
      // Quota exceeded or storage disabled — never crash the app over a save.
      if (isDev) console.warn("[persistence] failed to save selection:", err);
      return false;
    }
  },

  load() {
    if (typeof window === "undefined") return null;

    let raw: string | null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      if (isDev) console.warn("[persistence] failed to read selection:", err);
      return null;
    }
    if (raw === null) return null;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      if (isDev)
        console.warn("[persistence] saved selection is not valid JSON");
      return null;
    }

    const selection = parseSelection(parsed);
    if (selection === null && isDev) {
      console.warn(
        "[persistence] saved selection failed validation; using seed",
      );
    }
    return selection;
  },

  clear() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      if (isDev) console.warn("[persistence] failed to clear selection:", err);
    }
  },
};

/** In-memory persistence for tests and dependency injection. */
export function createMemoryPersistence(): SelectionPersistence {
  let stored: Selection | null = null;
  return {
    save(selection) {
      stored = structuredClone(selection);
      return true;
    },
    load() {
      return stored === null ? null : structuredClone(stored);
    },
    clear() {
      stored = null;
    },
  };
}
