"use client";

import { useState, useTransition } from "react";
import { improveTitlesAction } from "@/lib/actions/admin";

export function ImproveTitlesButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const res = await improveTitlesAction();
            setResult(
              res.updated
                ? `Updated ${res.updated} title${res.updated === 1 ? "" : "s"}.`
                : "No weak titles found.",
            );
          });
        }}
        className="rounded-full border border-line px-4 py-2 text-sm uppercase tracking-[0.14em] transition hover:border-ink disabled:opacity-50"
      >
        {pending ? "Improving…" : "Improve titles"}
      </button>
      {result ? <p className="text-sm text-muted">{result}</p> : null}
    </div>
  );
}
