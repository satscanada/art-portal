import { getPublicSiteStats } from "@/lib/analytics";
import { formatCount } from "@/lib/utils";

export async function VisitorCounter() {
  const stats = await getPublicSiteStats();

  if (!stats.total_views && !stats.unique_visitors) {
    return null;
  }

  return (
    <div
      className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted"
      aria-label="Gallery visitor stats"
    >
      <p>
        <span className="display text-base text-ink">
          {formatCount(stats.unique_visitors)}
        </span>{" "}
        visitors
      </p>
      <span className="hidden text-line sm:inline" aria-hidden>
        ·
      </span>
      <p>
        <span className="display text-base text-ink">
          {formatCount(stats.total_views)}
        </span>{" "}
        views
      </p>
    </div>
  );
}
