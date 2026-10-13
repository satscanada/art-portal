import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FavoriteButton } from "@/components/gallery/FavoriteButton";
import { GuestbookForm } from "@/components/gallery/GuestbookForm";
import { ImageZoom } from "@/components/gallery/ImageZoom";
import { ShareButtons } from "@/components/gallery/ShareButtons";
import { ViewTracker } from "@/components/gallery/ViewTracker";
import { getArtworkBySlug, listGalleryNav } from "@/lib/artworks";
import { getPublicImageUrl, siteConfig } from "@/lib/config";
import { listApprovedGuestbook } from "@/lib/guestbook";
import { formatCount } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);
  if (!artwork) {
    return { title: "Artwork" };
  }

  const imagePath = artwork.thumbnail_path || artwork.image_path;
  const imageUrl = getPublicImageUrl(imagePath);
  const description =
    artwork.caption?.trim() ||
    [artwork.medium, artwork.year].filter(Boolean).join(" · ") ||
    siteConfig.tagline;
  const path = `/artwork/${artwork.slug}`;

  return {
    title: artwork.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: artwork.title,
      description,
      url: path,
      siteName: siteConfig.name,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: artwork.width_px ?? undefined,
          height: artwork.height_px ?? undefined,
          alt: artwork.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: artwork.title,
      description,
      images: [imageUrl],
    },
  };
}

export default function ArtworkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="page-shell grid min-h-[60vh] animate-pulse gap-8 py-8 lg:grid-cols-2 lg:gap-10 lg:py-10">
          <div className="rounded-[1.25rem] bg-white/50 sm:rounded-[1.6rem]" />
          <div className="space-y-4">
            <div className="h-8 w-40 rounded bg-white/50" />
            <div className="h-12 w-3/4 rounded bg-white/60" />
            <div className="h-24 rounded bg-white/40" />
          </div>
        </div>
      }
    >
      <ArtworkContent params={params} />
    </Suspense>
  );
}

async function ArtworkContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);
  if (!artwork) notFound();

  const src = getPublicImageUrl(artwork.image_path);
  const nav = await listGalleryNav(slug);
  const notes = await listApprovedGuestbook(artwork.id).catch(() => []);

  return (
    <div className="page-shell grid gap-8 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:py-10">
      <ViewTracker path={`/artwork/${artwork.slug}`} artworkId={artwork.id} />

      <ImageZoom
        src={src}
        alt={artwork.title}
        width={artwork.width_px}
        height={artwork.height_px}
        prev={nav.prev}
        next={nav.next}
        positionLabel={
          nav.index >= 0 ? `${nav.index + 1} / ${nav.total}` : null
        }
      />

      <div className="animate-rise lg:pt-2">
        <Link
          href="/#gallery"
          className="inline-flex min-h-10 items-center text-sm uppercase tracking-[0.16em] text-muted transition hover:text-ink"
        >
          ← Back to gallery
        </Link>
        <h1 className="display mt-4 text-[clamp(1.85rem,6vw,3rem)] leading-tight text-ink">
          {artwork.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          {artwork.caption || "No caption yet."}
        </p>

        <dl className="mt-7 grid grid-cols-2 gap-4 text-sm sm:mt-8 sm:grid-cols-3">
          {artwork.medium ? (
            <div>
              <dt className="uppercase tracking-[0.16em] text-muted">Medium</dt>
              <dd className="mt-1 text-ink">{artwork.medium}</dd>
            </div>
          ) : null}
          {artwork.year ? (
            <div>
              <dt className="uppercase tracking-[0.16em] text-muted">Year</dt>
              <dd className="mt-1 text-ink">{artwork.year}</dd>
            </div>
          ) : null}
          <div>
            <dt className="uppercase tracking-[0.16em] text-muted">Views</dt>
            <dd className="mt-1 text-ink">{formatCount(artwork.view_count)}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.16em] text-muted">Loves</dt>
            <dd className="mt-1 text-ink">
              {formatCount(artwork.favorite_count)}
            </dd>
          </div>
        </dl>

        {artwork.tags?.length ? (
          <div className="mt-7 flex flex-wrap gap-2 sm:mt-8">
            {artwork.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/?tag=${tag.slug}#gallery`}
                className="rounded-full bg-accent-soft px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-accent sm:text-xs sm:tracking-[0.16em]"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <FavoriteButton
            artworkId={artwork.id}
            initialCount={artwork.favorite_count}
          />
        </div>

        <div className="mt-6">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-muted">
            Share this piece
          </p>
          <ShareButtons
            title={artwork.title}
            path={`/artwork/${artwork.slug}`}
          />
        </div>

        <div className="mt-10 space-y-4 border-t border-line pt-8">
          <div>
            <h2 className="display text-2xl text-ink">Leave a note</h2>
            <p className="mt-1 text-sm text-muted">
              Notes appear after approval. Or visit the{" "}
              <Link href="/guestbook" className="text-accent underline-offset-2 hover:underline">
                guestbook
              </Link>
              .
            </p>
          </div>
          <GuestbookForm artworkId={artwork.id} />
          {notes.length ? (
            <ul className="space-y-3 pt-2">
              {notes.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-[1.1rem] border border-line bg-surface/70 px-4 py-3"
                >
                  <p className="text-sm text-ink">{entry.message}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-muted">
                    {entry.author_name}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
