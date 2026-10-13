import Link from "next/link";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { DailyViewsChart } from "@/components/admin/AnalyticsCharts";
import { getAnalyticsDashboard } from "@/lib/analytics";
import { listTopFavorites } from "@/lib/artworks";
import { formatCount } from "@/lib/utils";

export default function AdminAnalyticsPage() {
  return (
    <div>
      <AdminNav />
      <h1 className="display text-4xl text-ink">Viewer analytics</h1>
      <p className="mt-2 text-muted">
        Anonymous visits, artwork attention, and traffic sources.
      </p>
      <Suspense
        fallback={
          <div className="mt-8 h-40 animate-pulse rounded-[1.5rem] bg-white/50" />
        }
      >
        <AnalyticsPanel />
      </Suspense>
    </div>
  );
}

async function AnalyticsPanel() {
  const [analytics, loved] = await Promise.all([
    getAnalyticsDashboard(),
    listTopFavorites(8).catch(() => []),
  ]);

  const cards = [
    {
      label: "Unique visitors",
      value: analytics.unique_visitors,
      hint: "Distinct sessions",
    },
    {
      label: "Total views",
      value: analytics.total_views,
      hint: "All pages",
    },
    {
      label: "Today",
      value: analytics.views_today,
      hint: "Views since midnight",
    },
    {
      label: "This week",
      value: analytics.views_week,
      hint: "Last 7 days",
    },
    {
      label: "Artwork views",
      value: analytics.artwork_views,
      hint: "Detail pages (14d)",
    },
    {
      label: "Mobile share",
      value: analytics.mobile_share,
      hint: "% of recent views",
      suffix: "%",
    },
  ];

  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="surface-panel rounded-[1.25rem] p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">
              {card.label}
            </p>
            <p className="display mt-2 text-3xl sm:text-4xl">
              {formatCount(card.value)}
              {card.suffix ?? ""}
            </p>
            <p className="mt-1 text-sm text-muted">{card.hint}</p>
          </div>
        ))}
      </div>

      <DailyViewsChart daily={analytics.daily} />

      <section>
        <h2 className="display text-2xl">Most loved</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {loved.map((artwork, index) => (
            <li
              key={artwork.id}
              className="surface-panel flex items-center justify-between gap-3 rounded-xl px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.14em] text-muted">
                  #{index + 1}
                </p>
                <Link
                  href={`/artwork/${artwork.slug}`}
                  className="block truncate font-medium hover:underline"
                >
                  {artwork.title}
                </Link>
              </div>
              <span className="shrink-0 text-sm text-muted">
                {formatCount(artwork.favorite_count)} loves
              </span>
            </li>
          ))}
          {!loved.length ? (
            <li className="text-muted">No favorites yet.</li>
          ) : null}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="display text-2xl">Top artworks</h2>
          <ul className="mt-4 space-y-2">
            {analytics.top_artworks.map((artwork, index) => (
              <li
                key={artwork.id}
                className="surface-panel flex items-center justify-between gap-3 rounded-xl px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">
                    #{index + 1}
                  </p>
                  <Link
                    href={`/artwork/${artwork.slug}`}
                    className="block truncate font-medium hover:underline"
                  >
                    {artwork.title}
                  </Link>
                </div>
                <span className="shrink-0 text-sm text-muted">
                  {formatCount(artwork.view_count)} views
                </span>
              </li>
            ))}
            {!analytics.top_artworks.length ? (
              <li className="text-muted">No views recorded yet.</li>
            ) : null}
          </ul>
        </section>

        <section>
          <h2 className="display text-2xl">Top sources</h2>
          <ul className="mt-4 space-y-2">
            {analytics.top_referrers.map((item) => (
              <li
                key={item.source}
                className="surface-panel flex items-center justify-between gap-3 rounded-xl px-4 py-3"
              >
                <span className="truncate font-medium">{item.source}</span>
                <span className="shrink-0 text-sm text-muted">
                  {formatCount(item.count)}
                </span>
              </li>
            ))}
            {!analytics.top_referrers.length ? (
              <li className="text-muted">No referrers yet.</li>
            ) : null}
          </ul>

          <div className="surface-panel mt-4 rounded-xl px-4 py-3 text-sm text-muted">
            Gallery page views (14d):{" "}
            <span className="text-ink">
              {formatCount(analytics.gallery_views)}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
