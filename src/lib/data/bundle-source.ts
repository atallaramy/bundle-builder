import { type BundleData, parseBundle } from "@/lib/domain/bundle";

/**
 * The catalog data source — the seam between the app and wherever the catalog
 * actually comes from. Same Adapter/DIP shape as the persistence seam
 * (`SelectionPersistence`): the store depends on this interface, not on `fetch`,
 * so the backing store is swappable (the bundled `/api/bundle` route today; a
 * real backend / CMS tomorrow) without touching a single consumer.
 *
 * A `load()` MUST return a fully validated `BundleData` or throw — never a raw,
 * unchecked payload. Validation lives in `parseBundle`, so every source (network
 * or otherwise) is held to the same catalog invariants.
 */
export interface BundleSource {
  /** Fetch the catalog and validate it. Throws on a transport failure or a
   *  payload that fails `parseBundle`. */
  load(): Promise<BundleData>;
}

/**
 * The default source: the bonus `/api/bundle` route (BRIEF "Data"). The response
 * is untrusted input from over the wire, so it is run through `parseBundle`
 * before the store will trust it — a malformed or tampered payload throws loudly
 * rather than poisoning derived totals downstream (CLAUDE.md: validate the
 * payload, no silent failures).
 */
export const apiBundleSource: BundleSource = {
  async load() {
    const res = await fetch("/api/bundle");
    if (!res.ok) {
      throw new Error(`/api/bundle responded ${res.status} ${res.statusText}`);
    }
    return parseBundle(await res.json());
  },
};
