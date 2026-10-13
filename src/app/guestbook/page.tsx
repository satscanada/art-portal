import { Suspense } from "react";
import { GuestbookForm } from "@/components/gallery/GuestbookForm";
import { listApprovedGuestbook } from "@/lib/guestbook";
import { siteConfig } from "@/lib/config";

export const metadata = {
  title: "Guestbook",
  description: `Leave a note for ${siteConfig.artistName}.`,
};

export default function GuestbookPage() {
  return (
    <div className="page-shell py-8 sm:py-12">
      <div className="max-w-2xl animate-rise">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          Visitor notes
        </p>
        <h1 className="display mt-2 text-[clamp(2rem,6vw,3.25rem)] text-ink">
          Guestbook
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
          Share a kind word for {siteConfig.artistName}. Notes appear after a
          quick review.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
        <GuestbookForm />
        <Suspense
          fallback={
            <div className="h-48 animate-pulse rounded-[1.5rem] bg-white/50" />
          }
        >
          <GuestbookList />
        </Suspense>
      </div>
    </div>
  );
}

async function GuestbookList() {
  let entries: Awaited<ReturnType<typeof listApprovedGuestbook>> = [];
  try {
    entries = await listApprovedGuestbook();
  } catch {
    entries = [];
  }

  if (!entries.length) {
    return (
      <div className="surface-panel rounded-[1.5rem] p-6">
        <p className="display text-2xl text-ink">Be the first</p>
        <p className="mt-2 text-sm text-muted">
          Approved notes will appear here.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="surface-panel rounded-[1.25rem] p-5 animate-rise"
        >
          <p className="text-sm leading-relaxed text-ink">{entry.message}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted">
            {entry.author_name}
            <span className="mx-2 text-line">·</span>
            {new Date(entry.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </li>
      ))}
    </ul>
  );
}
