import Link from "next/link";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { getPublicSiteStats } from "@/lib/analytics";
import { listAllArtworksAdmin } from "@/lib/artworks";
import { formatCount } from "@/lib/utils";

export default function AdminHomePage() {
  return (
    <div>
      <AdminNav />
      <h1 className="display text-4xl text-ink">Studio desk</h1>
      <p className="mt-2 text-muted">
        Upload, tag, caption, and watch how the gallery is discovered.
      </p>
      <Suspense fallback={<div className="mt-8 h-40 animate-pulse rounded-[1.5rem] bg-white/50" />}>
        <AdminOverview />
      </Suspense>
    </div>
  );
}

async function AdminOverview() {
  const [artworks, stats] = await Promise.all([
    listAllArtworksAdmin(),
    getPublicSiteStats(),
  ]);

  const published = artworks.filter((item) => item.is_published).length;

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="surface-panel rounded-[1.25rem] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">
            Artworks
          </p>
          <p className="display mt-2 text-3xl">{artworks.length}</p>
          <p className="mt-1 text-sm text-muted">{published} published</p>
        </div>
        <div className="surface-panel rounded-[1.25rem] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">
            Visitors
          </p>
          <p className="display mt-2 text-3xl">
            {formatCount(stats.unique_visitors)}
          </p>
        </div>
        <div className="surface-panel rounded-[1.25rem] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">
            Page views
          </p>
          <p className="display mt-2 text-3xl">
            {formatCount(stats.total_views)}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/artworks/new"
          className="rounded-full bg-ink px-5 py-3 text-sm uppercase tracking-[0.14em] text-[#fff]"
        >
          Upload artwork
        </Link>
        <Link
          href="/admin/analytics"
          className="rounded-full border border-line px-5 py-3 text-sm uppercase tracking-[0.14em]"
        >
          View analytics
        </Link>
        <Link
          href="/admin/tags"
          className="rounded-full border border-line px-5 py-3 text-sm uppercase tracking-[0.14em]"
        >
          Manage tags
        </Link>
        <Link
          href="/admin/guestbook"
          className="rounded-full border border-line px-5 py-3 text-sm uppercase tracking-[0.14em]"
        >
          Moderate guestbook
        </Link>
        <Link
          href="/admin/news"
          className="rounded-full border border-line px-5 py-3 text-sm uppercase tracking-[0.14em]"
        >
          News & exhibitions
        </Link>
      </div>
    </>
  );
}
