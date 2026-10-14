"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import { Check, GripVertical, Pencil, Pin } from "lucide-react";
import {
  renameArtworkTitleAction,
  reorderArtworksAction,
  setArtworkFeaturedAction,
} from "@/lib/actions/admin";
import { getPublicImageUrl } from "@/lib/config";
import type { Artwork } from "@/lib/types";
import { cn, formatCount, isArtworkLive } from "@/lib/utils";

function statusLabel(artwork: Artwork) {
  if (!artwork.is_published) return "Draft";
  if (!isArtworkLive(artwork)) return "Scheduled";
  return "Live";
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const skipBlurSave = useRef(false);

  useEffect(() => {
    setItems(initialArtworks);
    itemsRef.current = initialArtworks;
  }, [initialArtworks]);

  useEffect(() => {
    if (editingId) titleInputRef.current?.focus();
  }, [editingId]);

  function persistOrder(next: Artwork[]) {
    startTransition(async () => {
      await reorderArtworksAction(next.map((item) => item.id));
      setMessage("Order saved");
    });
  }

  function onDragStart(event: DragEvent, index: number) {
    setDragIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  }

  function onDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
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
    if (dragIndex === null) return;
    setDragIndex(null);
    persistOrder(itemsRef.current);
  }

  function beginEdit(artwork: Artwork) {
    setEditingId(artwork.id);
    setDraftTitle(artwork.title);
  }

  function cancelEdit() {
    skipBlurSave.current = true;
    setEditingId(null);
    setDraftTitle("");
  }

  function saveTitle(artwork: Artwork) {
    if (skipBlurSave.current) {
      skipBlurSave.current = false;
      return;
    }

    const nextTitle = draftTitle.trim();
    if (!nextTitle || nextTitle === artwork.title) {
      setEditingId(null);
      setDraftTitle("");
      return;
    }

    const previous = artwork.title;
    setItems((current) => {
      const next = current.map((item) =>
        item.id === artwork.id ? { ...item, title: nextTitle } : item,
      );
      itemsRef.current = next;
      return next;
    });
    setEditingId(null);

    startTransition(async () => {
      const result = await renameArtworkTitleAction(artwork.id, nextTitle);
      if (result && "error" in result && result.error) {
        setItems((current) => {
          const next = current.map((item) =>
            item.id === artwork.id ? { ...item, title: previous } : item,
          );
          itemsRef.current = next;
          return next;
        });
        setMessage(result.error);
        return;
      }
      setMessage("Title saved");
    });
  }

  function onTitleKeyDown(event: KeyboardEvent<HTMLInputElement>, artwork: Artwork) {
    if (event.key === "Enter") {
      event.preventDefault();
      saveTitle(artwork);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
    }
  }

  function togglePin(artwork: Artwork) {
    const nextFeatured = !artwork.is_featured;
    setItems((current) => {
      const next = current.map((item) =>
        item.id === artwork.id ? { ...item, is_featured: nextFeatured } : item,
      );
      itemsRef.current = next;
      return next;
    });

    startTransition(async () => {
      const result = await setArtworkFeaturedAction(artwork.id, nextFeatured);
      if (result && "error" in result && result.error) {
        setItems((current) => {
          const next = current.map((item) =>
            item.id === artwork.id
              ? { ...item, is_featured: artwork.is_featured }
              : item,
          );
          itemsRef.current = next;
          return next;
        });
        setMessage(result.error);
        return;
      }
      setMessage(nextFeatured ? "Pinned to hero" : "Unpinned");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          Drag cards to rearrange. Edit titles inline. Pin for the hero mosaic.
        </p>
        <p className="text-sm text-muted">
          {pending ? "Saving…" : message ? message : `${items.length} works`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((artwork, index) => {
          const editing = editingId === artwork.id;

          return (
            <article
              key={artwork.id}
              draggable={!editing}
              onDragStart={(event) => onDragStart(event, index)}
              onDragOver={(event) => onDragOver(event, index)}
              onDragEnd={onDragEnd}
              className={cn(
                "surface-panel group relative overflow-hidden rounded-[1.25rem] transition",
                dragIndex === index && "scale-[0.98] opacity-70 ring-2 ring-accent",
              )}
            >
              <div className="relative aspect-[4/5] bg-[#d7dee4]">
                <Image
                  src={getPublicImageUrl(
                    artwork.thumbnail_path || artwork.image_path,
                  )}
                  alt={artwork.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  draggable={false}
                />

                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
                  <span className="inline-flex size-9 cursor-grab items-center justify-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur active:cursor-grabbing">
                    <GripVertical className="size-4" />
                  </span>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      togglePin(artwork);
                    }}
                    onMouseDown={(event) => event.stopPropagation()}
                    className={cn(
                      "inline-flex size-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition",
                      artwork.is_featured
                        ? "bg-accent text-white"
                        : "bg-white/90 text-muted hover:text-ink",
                    )}
                    aria-label={
                      artwork.is_featured ? "Unpin from hero" : "Pin to hero"
                    }
                    title={
                      artwork.is_featured ? "Unpin from hero" : "Pin to hero"
                    }
                  >
                    <Pin
                      className={cn(
                        "size-4",
                        artwork.is_featured && "fill-current",
                      )}
                    />
                  </button>
                </div>

                <div className="absolute bottom-2 left-2 rounded-full bg-ink/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white backdrop-blur">
                  {index + 1}
                </div>
              </div>

              <div className="space-y-2 p-3">
                {editing ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      ref={titleInputRef}
                      value={draftTitle}
                      onChange={(event) => setDraftTitle(event.target.value)}
                      onKeyDown={(event) => onTitleKeyDown(event, artwork)}
                      onBlur={() => saveTitle(artwork)}
                      maxLength={160}
                      className="min-w-0 flex-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm outline-none focus:border-accent"
                      aria-label="Artwork title"
                    />
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => saveTitle(artwork)}
                      className="inline-flex size-8 items-center justify-center rounded-full bg-ink text-white"
                      aria-label="Save title"
                    >
                      <Check className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start gap-1.5">
                    <p className="display min-w-0 flex-1 text-base leading-snug text-ink">
                      {artwork.title}
                    </p>
                    <button
                      type="button"
                      onClick={() => beginEdit(artwork)}
                      onMouseDown={(event) => event.stopPropagation()}
                      className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-white hover:text-ink"
                      aria-label={`Rename ${artwork.title}`}
                      title="Rename"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                  </div>
                )}

                <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
                  {statusLabel(artwork)}
                  {" · "}
                  {formatCount(artwork.view_count)} views
                </p>

                <Link
                  href={`/admin/artworks/${artwork.id}`}
                  className="inline-flex text-xs uppercase tracking-[0.14em] text-accent transition hover:underline"
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  Edit details
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {!items.length ? (
        <p className="text-muted">No artworks yet. Upload the first one.</p>
      ) : null}
    </div>
  );
}
