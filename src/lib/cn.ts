/** Join truthy class strings. A minimal `cn` — we control the class sets, so no
 *  conflict-resolution (tailwind-merge) or extra deps are warranted here. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
