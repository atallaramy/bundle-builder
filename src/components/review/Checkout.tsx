"use client";

import { useState } from "react";
import type { Selection } from "@/lib/domain/selection";
import { useBundleStore } from "@/lib/store/bundle-store";

/**
 * Checkout (placeholder confirmation — the brief has it go nowhere) and the
 * "Save my system for later" action, which persists the configuration via the
 * store's `save()`. `save()` returns whether the write landed, so we show a real
 * "Saved" only on success and a loud error otherwise — never a false confirmation
 * (BRIEF "Persistence").
 */
export function Checkout() {
  const save = useBundleStore((s) => s.save);
  const selection = useBundleStore((s) => s.selection);

  const [checkedOut, setCheckedOut] = useState(false);
  // Snapshot the whole selection object at save time. Every store edit (a
  // quantity change AND a variant switch — both part of the persisted payload)
  // swaps in a new selection reference, so `saved` derives to false and a stale
  // "Saved" clears itself with no effect needed.
  const [savedSnapshot, setSavedSnapshot] = useState<Selection | null>(null);
  const [failed, setFailed] = useState(false);
  const saved = savedSnapshot !== null && savedSnapshot === selection;

  function handleSave() {
    if (save()) {
      setSavedSnapshot(selection);
      setFailed(false);
    } else {
      setFailed(true);
    }
  }

  return (
    <div className="mt-1 flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => setCheckedOut(true)}
        className="w-full cursor-pointer rounded-xs bg-brand py-[13px] text-checkout text-white transition-colors hover:bg-brand/90"
      >
        Checkout
      </button>

      {checkedOut && (
        <p role="status" className="text-center text-body text-ink-soft">
          Thanks! This is a demo — checkout isn&apos;t wired up.
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        // Save-later scales per layout (Figma): 12px on mobile → 14px on desktop
        // (both routes). The mobile base is shared, so the bump is `lg:`.
        className="cursor-pointer text-center text-[12px] leading-[14.4px] font-normal tracking-[-0.02px] text-label italic underline lg:text-[14px] lg:leading-[16.8px]"
      >
        {saved ? "Saved for later ✓" : "Save my system for later"}
      </button>

      {failed && (
        <p role="alert" className="text-center text-body text-danger">
          Couldn&apos;t save — your browser blocked local storage.
        </p>
      )}
    </div>
  );
}
