import Link from "next/link";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { listExhibitionsAdmin } from "@/lib/exhibitions";
import { formatExhibitionDates } from "@/lib/utils";

export default function AdminNewsPage() {
  return (
    <div>
      <AdminNav />
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl text-ink">News & exhibitions</h1>
          <p className="mt-2 text-muted">
            School shows, awards, and studio announcements.
          </p>
        </div>
        <Link
          href="/admin/news/new"
          className="rounded-full bg-ink px-4 py-2 text-sm uppercase tracking-[0.14em] text-white"
        >
          New
        </Link>
      </div>
      <Suspense
        fallback={
          <div className="h-40 animate-pulse rounded-[1.5rem] bg-white/50" />
        }
      >
        <NewsAdminList />
      </Suspense>
    </div>
  );
}

async function NewsAdminList() {
  const items = await listExhibitionsAdmin();

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/admin/news/${item.id}`}
          className="surface-panel block rounded-[1.25rem] p-4 transition hover:border-ink"
        >
          <p className="font-medium text-ink">{item.title}</p>
          <p className="mt-1 text-sm text-muted">
            {item.is_published ? "Published" : "Draft"}
            {" · "}
            {formatExhibitionDates(item.starts_on, item.ends_on) ||
              "No dates"}
            {item.location ? ` · ${item.location}` : ""}
          </p>
        </Link>
      ))}
      {!items.length ? (
        <p className="text-muted">No news yet. Add the first exhibition.</p>
      ) : null}
    </div>
  );
}
