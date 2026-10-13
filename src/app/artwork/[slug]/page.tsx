import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ImageZoom } from "@/components/gallery/ImageZoom";
import { ViewTracker } from "@/components/gallery/ViewTracker";
import { getArtworkBySlug } from "@/lib/artworks";
import { getPublicImageUrl } from "@/lib/config";
import { formatCount } from "@/lib/utils";

export default function ArtworkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto grid min-h-[60vh] w-full max-w-6xl animate-pulse gap-10 px-5 py-10 lg:grid-cols-2 sm:px-8">
          <div className="rounded-[1.6rem] bg-white/50" />
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

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[1.15fr_0.85fr] sm:px-8">
      <ViewTracker path={`/artwork/${artwork.slug}`} artworkId={artwork.id} />

      <ImageZoom
        src={src}
        alt={artwork.title}
        width={artwork.width_px}
        height={artwork.height_px}
      />

      <div className="animate-rise">
        <Link
          href="/#gallery"
          className="text-sm uppercase tracking-[0.16em] text-muted transition hover:text-ink"
        >
          ← Back to gallery
        </Link>
        <h1 className="display mt-5 text-4xl text-ink sm:text-5xl">
          {artwork.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          {artwork.caption || "No caption yet."}
        </p>

        <dl className="mt-8 grid gap-4 text-sm">
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
        </dl>

        {artwork.tags?.length ? (
          <div className="mt-8 flex flex-wrap gap-2">
            {artwork.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/?tag=${tag.slug}#gallery`}
                className="rounded-full bg-accent-soft px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-accent"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
