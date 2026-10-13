import Link from "next/link";
import { Suspense } from "react";
import { listPublishedExhibitions } from "@/lib/exhibitions";
import { siteConfig } from "@/lib/config";
import { formatExhibitionDates } from "@/lib/utils";

export const metadata = {
  title: "News & exhibitions",
  description: `Shows, awards, and news from ${siteConfig.artistName}.`,
};

export default function NewsPage() {
  return (
    <div className="page-shell py-8 sm:py-12">
      <div className="max-w-2xl animate-rise">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          Outside the studio
        </p>
        <h1 className="display mt-2 text-[clamp(2rem,6vw,3.25rem)] text-ink">
          News & exhibitions
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
          School shows, awards, and moments worth remembering.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="mt-10 h-40 animate-pulse rounded-[1.5rem] bg-white/50" />
        }
      >
        <NewsList />
      </Suspense>
    </div>
  );
}

async function NewsList() {
  let items: Awaited<ReturnType<typeof listPublishedExhibitions>> = [];
  try {
    items = await listPublishedExhibitions();
  } catch {
    items = [];
  }

  if (!items.length) {
    return (
      <div className="surface-panel mt-10 rounded-[1.5rem] p-6 sm:p-8">
        <p className="display text-2xl text-ink">Coming soon</p>
        <p className="mt-2 text-sm text-muted sm:text-base">
          Exhibition and news posts will appear here.
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-10 space-y-4">
      {items.map((item, index) => {
        const dates = formatExhibitionDates(item.starts_on, item.ends_on);
        return (
          <li
            key={item.id}
            className="animate-rise"
            style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
          >
            <Link
              href={`/news/${item.slug}`}
              className="surface-panel block rounded-[1.35rem] p-5 transition hover:border-ink sm:p-6"
            >
              <p className="display text-2xl text-ink sm:text-3xl">
                {item.title}
              </p>
              {item.summary ? (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                  {item.summary}
                </p>
              ) : null}
              <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-muted">
                {[dates, item.location].filter(Boolean).join(" · ") || "Update"}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
