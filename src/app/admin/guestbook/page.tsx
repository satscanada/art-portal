import { Suspense } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import {
  approveGuestbookAction,
  deleteGuestbookAction,
} from "@/lib/actions/guestbook";
import { listGuestbookAdmin } from "@/lib/guestbook";

export default function AdminGuestbookPage() {
  return (
    <div>
      <AdminNav />
      <h1 className="display text-4xl text-ink">Guestbook</h1>
      <p className="mt-2 text-muted">
        Approve kind notes or remove anything that doesn&apos;t belong.
      </p>
      <Suspense
        fallback={
          <div className="mt-8 h-40 animate-pulse rounded-[1.5rem] bg-white/50" />
        }
      >
        <ModerationList />
      </Suspense>
    </div>
  );
}

async function ModerationList() {
  const entries = await listGuestbookAdmin();
  const pending = entries.filter((entry) => !entry.is_approved);

  return (
    <div className="mt-8 space-y-6">
      <p className="text-sm text-muted">
        {pending.length} pending · {entries.length} total
      </p>

      <ul className="space-y-3">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="surface-panel rounded-[1.25rem] p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-relaxed text-ink">
                  {entry.message}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted">
                  {entry.author_name}
                  <span className="mx-2">·</span>
                  {new Date(entry.created_at).toLocaleString()}
                  <span className="mx-2">·</span>
                  {entry.is_approved ? "Approved" : "Pending"}
                  {entry.artwork_id ? (
                    <>
                      <span className="mx-2">·</span>
                      Artwork note
                    </>
                  ) : null}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {!entry.is_approved ? (
                  <form action={approveGuestbookAction}>
                    <input type="hidden" name="id" value={entry.id} />
                    <button
                      type="submit"
                      className="rounded-full bg-ink px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-white"
                    >
                      Approve
                    </button>
                  </form>
                ) : null}
                <form action={deleteGuestbookAction}>
                  <input type="hidden" name="id" value={entry.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-red-300 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-red-700"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {!entries.length ? (
        <p className="text-muted">No guestbook entries yet.</p>
      ) : null}
    </div>
  );
}
