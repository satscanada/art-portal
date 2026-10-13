"use client";

import { useState, useTransition } from "react";
import { submitGuestbookAction } from "@/lib/actions/guestbook";

export function GuestbookForm({ artworkId }: { artworkId?: string }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="surface-panel space-y-4 rounded-[1.5rem] p-5 sm:p-6"
      action={(formData) => {
        startTransition(async () => {
          setStatus("idle");
          setMessage(null);
          const result = await submitGuestbookAction(formData);
          if (result && "error" in result && result.error) {
            setStatus("error");
            setMessage(result.error);
            return;
          }
          setStatus("ok");
          setMessage("Thanks — your note is waiting for approval.");
          (document.getElementById("guestbook-form") as HTMLFormElement | null)?.reset();
        });
      }}
      id="guestbook-form"
    >
      {artworkId ? (
        <input type="hidden" name="artwork_id" value={artworkId} />
      ) : null}

      <label className="block space-y-2 text-sm">
        <span className="uppercase tracking-[0.16em] text-muted">Your name</span>
        <input
          name="author_name"
          required
          maxLength={80}
          className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
          placeholder="Visitor"
        />
      </label>

      <label className="block space-y-2 text-sm">
        <span className="uppercase tracking-[0.16em] text-muted">Message</span>
        <textarea
          name="message"
          required
          maxLength={1000}
          rows={4}
          className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
          placeholder="A kind note for the artist…"
        />
      </label>

      {message ? (
        <p
          className={
            status === "error" ? "text-sm text-red-700" : "text-sm text-accent"
          }
        >
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-ink px-5 py-3 text-sm font-medium uppercase tracking-[0.14em] text-white transition hover:bg-accent disabled:opacity-50"
      >
        {pending ? "Sending…" : "Leave a note"}
      </button>
    </form>
  );
}
