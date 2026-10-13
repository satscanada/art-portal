import Image from "next/image";
import { getPublicImageUrl } from "@/lib/config";
import type { Artwork } from "@/lib/types";

const slots = [
  "hero-slot hero-slot-a",
  "hero-slot hero-slot-b",
  "hero-slot hero-slot-c",
  "hero-slot hero-slot-d",
  "hero-slot hero-slot-e",
  "hero-slot hero-slot-f",
  "hero-slot hero-slot-g",
  "hero-slot hero-slot-h",
] as const;

export function HeroBackdrop({ artworks }: { artworks: Artwork[] }) {
  if (!artworks.length) {
    return (
      <div
        aria-hidden
        className="hero-wash pointer-events-none absolute inset-x-0 top-4 -z-0 h-[52vh] overflow-hidden rounded-[1.5rem] sm:inset-x-2 sm:top-6 sm:h-[62vh] sm:rounded-[2rem]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(15,107,107,0.22),transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.55),rgba(197,216,224,0.4))]" />
      </div>
    );
  }

  const tiles = artworks.slice(0, slots.length);

  return (
    <div
      aria-hidden
      className="hero-wash pointer-events-none absolute inset-x-0 top-4 -z-0 h-[52vh] overflow-hidden rounded-[1.5rem] sm:inset-x-2 sm:top-6 sm:h-[62vh] sm:rounded-[2rem]"
    >
      <div className="hero-mosaic absolute inset-0">
        {tiles.map((artwork, index) => {
          const src = getPublicImageUrl(
            artwork.thumbnail_path || artwork.image_path,
          );
          return (
            <div key={artwork.id} className={slots[index]}>
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 768px) 45vw, 28vw"
                className="object-cover"
                priority={index < 3}
              />
            </div>
          );
        })}
      </div>

      {/* Keep brand readable over the living art wall */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(238,242,245,0.92)_0%,rgba(238,242,245,0.72)_38%,rgba(238,242,245,0.28)_62%,rgba(238,242,245,0.12)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(238,242,245,0.25)_0%,transparent_28%,transparent_58%,rgba(238,242,245,0.88)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_32%,rgba(15,107,107,0.14),transparent_40%)]" />
    </div>
  );
}
