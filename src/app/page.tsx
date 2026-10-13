import { Suspense } from "react";
import { ArtworkCard } from "@/components/gallery/ArtworkCard";
import { HeroBackdrop } from "@/components/gallery/HeroBackdrop";
import { Pagination } from "@/components/gallery/Pagination";
import { SearchBar } from "@/components/gallery/SearchBar";
import { TagFilter } from "@/components/gallery/TagFilter";
import { ViewTracker } from "@/components/gallery/ViewTracker";
import { listHeroArtworks, listTags, searchArtworks } from "@/lib/artworks";
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

      <section className="page-shell relative grid min-h-[72vh] items-end pb-12 pt-6 sm:min-h-[82vh] sm:pb-16 sm:pt-10">
        <Suspense fallback={<HeroBackdrop artworks={[]} />}>
          <HeroArtBackdrop />
        </Suspense>

        <div className="relative z-10 max-w-3xl animate-rise">
          <p className="display text-[clamp(2.4rem,11vw,5.75rem)] leading-[0.94] text-ink">
            {siteConfig.name}
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:mt-5 sm:text-xl">
            {siteConfig.tagline} — works by{" "}
            <span className="text-ink">{siteConfig.artistName}</span>.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 sm:mt-8">
            <a
              href="#gallery"
              className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 py-3 text-sm font-medium uppercase tracking-[0.14em] text-[#ffffff] transition hover:bg-accent hover:text-[#ffffff]"
            >
              Enter gallery
            </a>
          </div>
        </div>
      </section>

      <section id="gallery" className="page-shell relative z-10 pb-16 sm:pb-20">
        <div className="mb-7 flex flex-col gap-5 animate-rise-delay sm:mb-8 sm:gap-6">
          <div>
            <h2 className="display text-3xl text-ink sm:text-4xl">Gallery</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
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

async function HeroArtBackdrop() {
  let artworks: Awaited<ReturnType<typeof listHeroArtworks>> = [];
  try {
    artworks = await listHeroArtworks(8);
  } catch {
    artworks = [];
  }
  return <HeroBackdrop artworks={artworks} />;
}

function GalleryFallback() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-72 animate-pulse rounded-[1.25rem] bg-white/50 sm:h-80 sm:rounded-[1.35rem]"
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
      <div className="mb-5 sm:mb-6">
        <Suspense fallback={null}>
          <TagFilter tags={tags} />
        </Suspense>
      </div>

      {setupError ? (
        <div className="surface-panel rounded-[1.25rem] p-6 sm:rounded-[1.5rem] sm:p-8">
          <h3 className="display text-2xl">Almost ready</h3>
          <p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">
            Gallery data is still connecting. Please try again shortly.
          </p>
          <p className="mt-4 text-sm text-red-700">{setupError}</p>
        </div>
      ) : artworks.length === 0 ? (
        <div className="surface-panel rounded-[1.25rem] p-6 sm:rounded-[1.5rem] sm:p-8">
          <h3 className="display text-2xl">Gallery opening soon</h3>
          <p className="mt-2 text-sm text-muted sm:text-base">
            New works are being prepared. Please check back shortly.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted sm:mb-5">
            Showing {artworks.length} of {total}
            {params.q ? ` for “${params.q}”` : ""}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
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
