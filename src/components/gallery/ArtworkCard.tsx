import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/gallery/FavoriteButton";
import { getPublicImageUrl } from "@/lib/config";
import { formatCount } from "@/lib/utils";
import type { Artwork } from "@/lib/types";

export function ArtworkCard({
  artwork,
  index,
}: {
  artwork: Artwork;
  index: number;
}) {
  const src = getPublicImageUrl(artwork.thumbnail_path || artwork.image_path);

  return (
    <article
      className="animate-rise group"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className="gallery-frame overflow-hidden rounded-[1.2rem] p-2.5 transition duration-300 group-hover:-translate-y-0.5 sm:rounded-[1.35rem] sm:p-3">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[0.9rem] bg-[#d7dee4] sm:rounded-[1rem]">
          <Link href={`/artwork/${artwork.slug}`} className="absolute inset-0">
            <Image
              src={src}
              alt={artwork.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
            />
          </Link>
          <div className="absolute right-2 top-2 z-10">
            <FavoriteButton
              artworkId={artwork.id}
              initialCount={artwork.favorite_count}
              compact
            />
          </div>
        </div>
        <Link href={`/artwork/${artwork.slug}`} className="block px-1.5 pb-1.5 pt-3.5 sm:px-2 sm:pb-2 sm:pt-4">
          <h3 className="display text-lg leading-snug text-ink sm:text-xl">
            {artwork.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
            {artwork.caption || artwork.medium || "Untitled moment"}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-muted sm:text-[11px] sm:tracking-[0.16em]">
            {artwork.year ? <span>{artwork.year}</span> : null}
            {artwork.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-accent-soft px-2 py-0.5 text-accent"
              >
                {tag.name}
              </span>
            ))}
            <span className="ml-auto normal-case tracking-normal text-muted/90">
              {formatCount(artwork.view_count)} views
            </span>
          </div>
        </Link>
      </div>
    </article>
  );
}
