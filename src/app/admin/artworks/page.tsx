import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { listAllArtworksAdmin } from "@/lib/artworks";
import { getPublicImageUrl } from "@/lib/config";
import { formatCount } from "@/lib/utils";

export default function AdminArtworksPage() {
  return (
    <div>
      <AdminNav />
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl text-ink">Artworks</h1>
          <p className="mt-2 text-muted">Edit captions, tags, and visibility.</p>
        </div>
        <Link
          href="/admin/artworks/new"
          className="rounded-full bg-ink px-4 py-2 text-sm uppercase tracking-[0.14em] text-white"
        >
          New
        </Link>
      </div>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-[1.5rem] bg-white/50" />}>
        <ArtworkList />
      </Suspense>
    </div>
  );
}

async function ArtworkList() {
  const artworks = await listAllArtworksAdmin();

  return (
    <div className="space-y-3">
      {artworks.map((artwork) => (
        <Link
          key={artwork.id}
          href={`/admin/artworks/${artwork.id}`}
          className="surface-panel flex items-center gap-4 rounded-[1.25rem] p-3 transition hover:border-ink"
        >
          <div className="relative size-16 overflow-hidden rounded-xl bg-[#d7dee4]">
            <Image
              src={getPublicImageUrl(artwork.image_path)}
              alt={artwork.title}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-ink">{artwork.title}</p>
            <p className="truncate text-sm text-muted">
              {artwork.is_published ? "Published" : "Draft"} ·{" "}
              {formatCount(artwork.view_count)} views
            </p>
          </div>
        </Link>
      ))}
      {!artworks.length ? (
        <p className="text-muted">No artworks yet. Upload the first one.</p>
      ) : null}
    </div>
  );
}
