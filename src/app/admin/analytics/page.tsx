import Link from "next/link";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { getAnalyticsSummary } from "@/lib/artworks";
import { formatCount } from "@/lib/utils";

export default function AdminAnalyticsPage() {
  return (
    <div>
      <AdminNav />
      <h1 className="display text-4xl text-ink">Viewer analytics</h1>
      <p className="mt-2 text-muted">
        Anonymous page views and per-artwork attention.
      </p>
      <Suspense fallback={<div className="mt-8 h-40 animate-pulse rounded-[1.5rem] bg-white/50" />}>
        <AnalyticsPanel />
      </Suspense>
    </div>
  );
}

async function AnalyticsPanel() {
  const analytics = await getAnalyticsSummary();

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="surface-panel rounded-[1.25rem] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">
            Total views
          </p>
          <p className="display mt-2 text-4xl">
            {formatCount(analytics.total_views)}
          </p>
        </div>
        <div className="surface-panel rounded-[1.25rem] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">
            Unique sessions
          </p>
          <p className="display mt-2 text-4xl">
            {formatCount(analytics.unique_sessions)}
          </p>
        </div>
      </div>

      <h2 className="display mt-10 text-2xl">Top artworks</h2>
      <ul className="mt-4 space-y-2">
        {analytics.top_artworks.map((artwork) => (
          <li
            key={artwork.id}
            className="surface-panel flex items-center justify-between rounded-xl px-4 py-3"
          >
            <Link href={`/artwork/${artwork.slug}`} className="hover:underline">
              {artwork.title}
            </Link>
            <span className="text-sm text-muted">
              {formatCount(artwork.view_count)} views
            </span>
          </li>
        ))}
        {!analytics.top_artworks.length ? (
          <li className="text-muted">No views recorded yet.</li>
        ) : null}
      </ul>
    </>
  );
}
