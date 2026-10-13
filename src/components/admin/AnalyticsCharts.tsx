import type { DailyBucket } from "@/lib/analytics";
import { formatCount } from "@/lib/utils";

export function DailyViewsChart({ daily }: { daily: DailyBucket[] }) {
  const max = Math.max(1, ...daily.map((day) => day.views));

  return (
    <div className="surface-panel rounded-[1.25rem] p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="display text-xl text-ink">Last 14 days</h2>
          <p className="mt-1 text-sm text-muted">Views per day</p>
        </div>
      </div>
      <div className="mt-6 flex h-40 items-end gap-1.5 sm:gap-2">
        {daily.map((day) => {
          const height = Math.max(6, Math.round((day.views / max) * 100));
          return (
            <div
              key={day.date}
              className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
            >
              <div className="relative flex h-32 w-full items-end justify-center">
                <div
                  className="w-full max-w-8 rounded-t-md bg-accent/80 transition group-hover:bg-accent"
                  style={{ height: `${height}%` }}
                  title={`${day.label}: ${day.views} views · ${day.visitors} visitors`}
                />
              </div>
              <span className="truncate text-[10px] uppercase tracking-[0.08em] text-muted">
                {day.label.replace(/ .*/, "")}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-muted">
        Peak day:{" "}
        {formatCount(Math.max(...daily.map((day) => day.views), 0))} views
      </p>
    </div>
  );
}
