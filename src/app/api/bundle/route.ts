import { getBundle } from "@/lib/domain/bundle";

/**
 * Bonus endpoint (BRIEF "Data" — serving the JSON from an API is optional).
 * Returns the same validated catalog the app renders from. The app itself reads
 * the catalog via the static import in `lib/domain/bundle`, so it renders
 * instantly with no loading flash; this route exists to demonstrate the
 * data-over-the-wire path and keeps the door open for a future server fetch.
 */
export function GET() {
  return Response.json(getBundle());
}
