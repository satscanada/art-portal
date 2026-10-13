import { Suspense } from "react";
import { ArtworkCard } from "@/components/gallery/ArtworkCard";
import { Pagination } from "@/components/gallery/Pagination";
import { SearchBar } from "@/components/gallery/SearchBar";
import { TagFilter } from "@/components/gallery/TagFilter";
import { ViewTracker } from "@/components/gallery/ViewTracker";
import { listTags, searchArtworks } from "@/lib/artworks";
import { siteConfig } from "@/lib/config";

type SearchParams = Promise<{ q?: string; tag?: string; page?: string }>;

export default function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div>
      <ViewTracker path="/" />

      <section className="relative mx-auto grid min-h-[78vh] w-full max-w-6xl items-end px-5 pb-16 pt-10 sm:px-8">
        <div className="max-w-3xl animate-rise">
          <p className="display text-5xl leading-[0.95] text-ink sm:text-7xl md:text-8xl">
            {siteConfig.name}
          </p>
          <p className="mt-5 max-w-xl text-lg text-muted sm:text-xl">
            {siteConfig.tagline} — works by{" "}
            <span className="text-ink">{siteConfig.artistName}</span>.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#gallery"
              className="rounded-full bg-ink px-5 py-3 text-sm font-medium uppercase tracking-[0.14em] text-[#ffffff] transition hover:bg-accent hover:text-[#ffffff]"
            >
              Enter gallery
            </a>
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-8 -z-10 h-[55vh] rounded-[2rem] bg-[radial-gradient(circle_at_30%_20%,rgba(15,107,107,0.18),transparent_45%),linear-gradient(135deg,rgba(255,255,255,0.55),rgba(197,216,224,0.35))]"
        />
      </section>

      <section
        id="gallery"
        className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8"
      >
        <div className="mb-8 flex flex-col gap-6 animate-rise-delay">
          <div>
            <h2 className="display text-3xl text-ink sm:text-4xl">Gallery</h2>
            <p className="mt-2 text-muted">
              Search by feeling, medium, or tag. Open any piece to zoom and look
              closer.
            </p>
          </div>
          <Suspense fallback={<div className="h-12 rounded-full bg-white/50" />}>
            <SearchBar />
          </Suspense>
        </div>

        <Suspense fallback={<GalleryFallback />}>
          <GallerySection searchParams={searchParams} />
        </Suspense>
      </section>
    </div>
  );
}

function GalleryFallback() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-80 animate-pulse rounded-[1.35rem] bg-white/50"
        />
      ))}
    </div>
  );
}

async function GallerySection({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  let artworks: Awaited<ReturnType<typeof searchArtworks>>["artworks"] = [];
  let total = 0;
  let totalPages = 1;
  let tags: Awaited<ReturnType<typeof listTags>> = [];
  let setupError: string | null = null;

  try {
    const [gallery, allTags] = await Promise.all([
      searchArtworks({
        q: params.q,
        tag: params.tag,
        page,
      }),
      listTags(),
    ]);
    artworks = gallery.artworks;
    total = gallery.total;
    totalPages = gallery.totalPages;
    tags = allTags;
  } catch (error) {
    setupError =
      error instanceof Error
        ? error.message
        : "Connect Supabase to load the gallery.";
  }

  return (
    <>
      <div className="mb-6">
        <Suspense fallback={null}>
          <TagFilter tags={tags} />
        </Suspense>
      </div>

      {setupError ? (
        <div className="surface-panel rounded-[1.5rem] p-8">
          <h3 className="display text-2xl">Almost ready</h3>
          <p className="mt-3 max-w-2xl text-muted">
            Create a Supabase project, run{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-sm">
              supabase/migrations/001_initial.sql
            </code>
            , then add your keys to{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-sm">
              .env.local
            </code>
            . See <strong>DEPLOY.md</strong> for the full GitHub → Vercel →
            Namecheap path.
          </p>
          <p className="mt-4 text-sm text-red-700">{setupError}</p>
        </div>
      ) : artworks.length === 0 ? (
        <div className="surface-panel rounded-[1.5rem] p-8">
          <h3 className="display text-2xl">Gallery opening soon</h3>
          <p className="mt-2 text-muted">
            New works are being prepared. Please check back shortly.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-5 text-sm text-muted">
            Showing {artworks.length} of {total}
            {params.q ? ` for “${params.q}”` : ""}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artworks.map((artwork, index) => (
              <ArtworkCard key={artwork.id} artwork={artwork} index={index} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            query={{ q: params.q, tag: params.tag }}
          />
        </>
      )}
    </>
  );
}
