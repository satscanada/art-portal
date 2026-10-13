"use client";

import { useTransition } from "react";
import {
  deleteExhibitionAction,
  saveExhibitionAction,
} from "@/lib/actions/admin";
import type { Exhibition } from "@/lib/types";

export function ExhibitionForm({
  exhibition,
}: {
  exhibition?: Exhibition | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <form
        action={(formData) => {
          startTransition(async () => {
            await saveExhibitionAction(formData);
          });
        }}
        className="surface-panel space-y-5 rounded-[1.5rem] p-6"
      >
        {exhibition ? (
          <input type="hidden" name="id" value={exhibition.id} />
        ) : null}

        <label className="block space-y-2 text-sm">
          <span className="uppercase tracking-[0.16em] text-muted">Title</span>
          <input
            name="title"
            required
            defaultValue={exhibition?.title}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
          />
        </label>

        <label className="block space-y-2 text-sm">
          <span className="uppercase tracking-[0.16em] text-muted">Summary</span>
          <textarea
            name="summary"
            rows={3}
            defaultValue={exhibition?.summary}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
          />
        </label>

        <label className="block space-y-2 text-sm">
          <span className="uppercase tracking-[0.16em] text-muted">Details</span>
          <textarea
            name="body"
            rows={8}
            defaultValue={exhibition?.body}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm">
            <span className="uppercase tracking-[0.16em] text-muted">
              Location
            </span>
            <input
              name="location"
              defaultValue={exhibition?.location ?? ""}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="uppercase tracking-[0.16em] text-muted">Sort</span>
            <input
              name="sort_order"
              type="number"
              defaultValue={exhibition?.sort_order ?? 0}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm">
            <span className="uppercase tracking-[0.16em] text-muted">Starts</span>
            <input
              name="starts_on"
              type="date"
              defaultValue={exhibition?.starts_on ?? ""}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="uppercase tracking-[0.16em] text-muted">Ends</span>
            <input
              name="ends_on"
              type="date"
              defaultValue={exhibition?.ends_on ?? ""}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
            />
          </label>
        </div>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={exhibition?.is_published ?? true}
          />
          Published
        </label>

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-5 py-3 text-sm font-medium uppercase tracking-[0.14em] text-white transition hover:bg-accent disabled:opacity-50"
        >
          {pending ? "Saving…" : exhibition ? "Save changes" : "Publish news"}
        </button>
      </form>

      {exhibition ? (
        <form action={deleteExhibitionAction} className="surface-panel h-fit rounded-[1.5rem] p-6">
          <input type="hidden" name="id" value={exhibition.id} />
          <p className="text-sm text-muted">
            Remove this show or news item from the site.
          </p>
          <button
            type="submit"
            className="mt-4 rounded-full border border-red-300 px-4 py-2 text-sm text-red-700 transition hover:bg-red-50"
          >
            Delete
          </button>
        </form>
      ) : null}
    </div>
  );
}
