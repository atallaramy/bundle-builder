/**
 * Scaffold placeholder — confirms Manrope + design tokens are wired before the
 * real two-column builder lands (BUILD-PLAN step 4). Replaced then.
 */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-full max-w-4xl flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <p className="text-eyebrow text-label uppercase">Bundle Builder</p>
      <h1 className="text-page-title text-ink">Let&apos;s get started!</h1>
      <p className="max-w-md text-body text-ink-soft">
        Scaffold is live — Manrope and the design tokens are wired. The
        four-step builder and live review panel come next.
      </p>
      <span className="rounded-control bg-brand px-4 py-2 text-checkout text-white">
        Tokens OK
      </span>
    </main>
  );
}
