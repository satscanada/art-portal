import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { siteConfig } from "@/lib/config";
import { getExhibitionBySlug } from "@/lib/exhibitions";
import { formatExhibitionDates } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getExhibitionBySlug(slug);
  if (!item) return { title: "News" };

  const description = item.summary || siteConfig.tagline;
  const path = `/news/${item.slug}`;

  return {
    title: item.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: item.title,
      description,
      url: path,
      siteName: siteConfig.name,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description,
    },
  };
}

export default function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="page-shell py-10">
          <div className="h-40 animate-pulse rounded-[1.5rem] bg-white/50" />
        </div>
      }
    >
      <NewsDetail params={params} />
    </Suspense>
  );
}

async function NewsDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getExhibitionBySlug(slug);
  if (!item) notFound();

  const dates = formatExhibitionDates(item.starts_on, item.ends_on);

  return (
    <article className="page-shell max-w-3xl py-8 sm:py-12">
      <Link
        href="/news"
        className="inline-flex min-h-10 items-center text-sm uppercase tracking-[0.16em] text-muted transition hover:text-ink"
      >
        ← All news
      </Link>
      <h1 className="display mt-5 text-[clamp(2rem,6vw,3.4rem)] leading-tight text-ink">
        {item.title}
      </h1>
      <p className="mt-4 text-xs uppercase tracking-[0.16em] text-muted">
        {[dates, item.location].filter(Boolean).join(" · ")}
      </p>
      {item.summary ? (
        <p className="mt-6 text-lg leading-relaxed text-muted">{item.summary}</p>
      ) : null}
      {item.body ? (
        <div className="mt-8 whitespace-pre-wrap text-base leading-relaxed text-ink">
          {item.body}
        </div>
      ) : null}
    </article>
  );
}
