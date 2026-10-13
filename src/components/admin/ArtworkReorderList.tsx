"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useTransition, type DragEvent } from "react";
import { GripVertical } from "lucide-react";
import {
  reorderArtworksAction,
  toggleFeaturedAction,
} from "@/lib/actions/admin";
import { getPublicImageUrl } from "@/lib/config";
import type { Artwork } from "@/lib/types";
import { formatCount, isArtworkLive } from "@/lib/utils";

function statusLabel(artwork: Artwork) {
  if (!artwork.is_published) return "Draft";
  if (!isArtworkLive(artwork)) return "Scheduled";
  return "Published";
}

export function ArtworkReorderList({
  initialArtworks,
}: {
  initialArtworks: Artwork[];
}) {
  const [items, setItems] = useState(initialArtworks);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function onDragStart(index: number) {
    setDragIndex(index);
  }

  function onDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setItems((current) => {
      const next = [...current];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      itemsRef.current = next;
      return next;
    });
    setDragIndex(index);
  }

  function onDragEnd() {
    setDragIndex(null);
    startTransition(async () => {
      await reorderArtworksAction(itemsRef.current.map((item) => item.id));
      setMessage("Gallery order saved.");
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        Drag the handle to reorder. Top of the list appears first in the
        gallery.
        {pending ? " Saving…" : message ? ` ${message}` : ""}
      </p>

      {items.map((artwork, index) => (
        <div
          key={artwork.id}
          draggable
          onDragStart={() => onDragStart(index)}
          onDragOver={(event) => onDragOver(event, index)}
          onDragEnd={onDragEnd}
          className={`surface-panel flex items-center gap-3 rounded-[1.25rem] p-3 ${
            dragIndex === index ? "opacity-70 ring-1 ring-accent" : ""
          }`}
        >
          <span
            className="cursor-grab touch-none rounded-lg p-1 text-muted active:cursor-grabbing"
            aria-hidden
          >
            <GripVertical className="size-5" />
          </span>

          <Link
            href={`/admin/artworks/${artwork.id}`}
            className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-[#d7dee4]"
          >
            <Image
              src={getPublicImageUrl(artwork.image_path)}
              alt={artwork.title}
              fill
              className="object-cover"
              sizes="64px"
            />
          </Link>

          <Link
            href={`/admin/artworks/${artwork.id}`}
            className="min-w-0 flex-1 transition hover:opacity-80"
          >
            <p className="truncate font-medium text-ink">{artwork.title}</p>
            <p className="truncate text-sm text-muted">
              {statusLabel(artwork)}
              {artwork.is_featured ? " · Featured" : ""}
              {" · "}
              {formatCount(artwork.view_count)} views
              {" · "}
              {formatCount(artwork.favorite_count)} loves
            </p>
          </Link>

          <form action={toggleFeaturedAction}>
            <input type="hidden" name="id" value={artwork.id} />
            <input
              type="hidden"
              name="is_featured"
              value={artwork.is_featured ? "true" : "false"}
            />
            <button
              type="submit"
              className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.14em] transition ${
                artwork.is_featured
                  ? "bg-accent text-white"
                  : "border border-line text-muted hover:border-ink hover:text-ink"
              }`}
            >
              {artwork.is_featured ? "Unpin" : "Pin"}
            </button>
          </form>
        </div>
      ))}

      {!items.length ? (
        <p className="text-muted">No artworks yet. Upload the first one.</p>
      ) : null}
    </div>
  );
}
