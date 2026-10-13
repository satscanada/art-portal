import Image from "next/image";
import Link from "next/link";
import { getPublicImageUrl } from "@/lib/config";
import { formatCount } from "@/lib/utils";
import type { Artwork } from "@/lib/types";

export function ArtworkCard({ artwork, index }: { artwork: Artwork; index: number }) {
  const src = getPublicImageUrl(artwork.thumbnail_path || artwork.image_path);

  return (
    <article
      className="animate-rise group"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <Link href={`/artwork/${artwork.slug}`} className="block">
        <div className="gallery-frame overflow-hidden rounded-[1.35rem] p-3">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1rem] bg-[#d7dee4]">
            <Image
              src={src}
              alt={artwork.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
            />
          </div>
          <div className="px-2 pb-2 pt-4">
            <h3 className="display text-xl text-ink">{artwork.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted">
              {artwork.caption || artwork.medium || "Untitled moment"}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted">
              {artwork.year ? <span>{artwork.year}</span> : null}
              {artwork.tags?.slice(0, 2).map((tag) => (
                <span key={tag.id} className="rounded-full bg-accent-soft px-2 py-0.5 text-accent">
                  {tag.name}
                </span>
              ))}
              <span className="ml-auto">{formatCount(artwork.view_count)} views</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
