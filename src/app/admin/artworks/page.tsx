import Link from "next/link";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { ArtworkReorderList } from "@/components/admin/ArtworkReorderList";
import { ImproveTitlesButton } from "@/components/admin/ImproveTitlesButton";
import { listAllArtworksAdmin } from "@/lib/artworks";

export default function AdminArtworksPage() {
  return (
    <div>
      <AdminNav />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="display text-4xl text-ink">Artworks</h1>
          <p className="mt-2 text-muted">
            Drag cards to reorder, pin icons for the hero, rename titles in place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ImproveTitlesButton />
          <Link
            href="/admin/artworks/new"
            className="rounded-full bg-ink px-4 py-2 text-sm uppercase tracking-[0.14em] text-white"
          >
            New
          </Link>
        </div>
      </div>
      <Suspense
        fallback={
          <div className="h-40 animate-pulse rounded-[1.5rem] bg-white/50" />
        }
      >
        <ArtworkList />
      </Suspense>
    </div>
  );
}

async function ArtworkList() {
  const artworks = await listAllArtworksAdmin();
  return <ArtworkReorderList initialArtworks={artworks} />;
}
