"use client";

import { useEffect, useState, useTransition, type MouseEvent } from "react";
import { Heart } from "lucide-react";
import { toggleFavoriteAction } from "@/lib/actions/favorites";
import {
  getVisitorSessionId,
  readLocalFavorites,
  writeLocalFavorites,
} from "@/lib/session";
import { cn, formatCount } from "@/lib/utils";

export function FavoriteButton({
  artworkId,
  initialCount,
  compact = false,
}: {
  artworkId: string;
  initialCount: number;
  compact?: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [active, setActive] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setActive(readLocalFavorites().includes(artworkId));
  }, [artworkId]);

  function toggle(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const sessionId = getVisitorSessionId();
    if (!sessionId || pending) return;

    const next = !active;
    const previousCount = count;
    setActive(next);
    setCount((value) => Math.max(0, value + (next ? 1 : -1)));

    const favorites = new Set(readLocalFavorites());
    if (next) favorites.add(artworkId);
    else favorites.delete(artworkId);
    writeLocalFavorites([...favorites]);

    startTransition(async () => {
      const result = await toggleFavoriteAction({
        artworkId,
        sessionId,
        makeFavorite: next,
      });
      if (result && "error" in result && result.error) {
        setActive(!next);
        setCount(previousCount);
        const rollback = new Set(readLocalFavorites());
        if (next) rollback.delete(artworkId);
        else rollback.add(artworkId);
        writeLocalFavorites([...rollback]);
        return;
      }
      if (result && "count" in result && typeof result.count === "number") {
        setCount(result.count);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={active}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      className={cn(
        "inline-flex items-center gap-1.5 transition disabled:opacity-60",
        compact
          ? "rounded-full bg-white/90 px-2.5 py-1.5 text-[11px] text-ink shadow-sm backdrop-blur"
          : "rounded-full border border-line bg-surface px-3.5 py-2 text-xs uppercase tracking-[0.14em] text-ink hover:border-ink",
      )}
    >
      <Heart
        className={cn(
          "size-3.5",
          active ? "fill-[#c45c4a] text-[#c45c4a]" : "text-muted",
        )}
      />
      <span>{compact ? formatCount(count) : active ? "Loved" : "Love this"}</span>
      {!compact ? (
        <span className="text-muted">{formatCount(count)}</span>
      ) : null}
    </button>
  );
}
