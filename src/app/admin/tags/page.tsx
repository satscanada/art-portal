import { Suspense } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { deleteTagAction, upsertTagAction } from "@/lib/actions/admin";
import { listTags } from "@/lib/artworks";

export default function AdminTagsPage() {
  return (
    <div>
      <AdminNav />
      <h1 className="display text-4xl text-ink">Tags</h1>
      <p className="mt-2 text-muted">
        Tags power filters and smart search across the gallery.
      </p>

      <form
        action={upsertTagAction}
        className="surface-panel mt-8 flex flex-col gap-3 rounded-[1.25rem] p-5 sm:flex-row"
      >
        <input
          name="name"
          required
          placeholder="New tag name"
          className="flex-1 rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-full bg-ink px-5 py-3 text-sm uppercase tracking-[0.14em] text-white"
        >
          Add tag
        </button>
      </form>

      <Suspense fallback={<div className="mt-6 h-24 animate-pulse rounded-xl bg-white/50" />}>
        <TagList />
      </Suspense>
    </div>
  );
}

async function TagList() {
  const tags = await listTags();

  return (
    <ul className="mt-6 space-y-2">
      {tags.map((tag) => (
        <li
          key={tag.id}
          className="surface-panel flex items-center justify-between rounded-xl px-4 py-3"
        >
          <div>
            <p className="font-medium">{tag.name}</p>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">
              {tag.slug}
            </p>
          </div>
          <form action={deleteTagAction}>
            <input type="hidden" name="id" value={tag.id} />
            <button
              type="submit"
              className="text-sm text-red-700 hover:underline"
            >
              Delete
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
