"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import {
  deleteArtworkAction,
  saveArtworkAction,
  uploadArtworkImage,
} from "@/lib/actions/admin";
import { getPublicImageUrl } from "@/lib/config";
import type { Artwork, Tag } from "@/lib/types";
import { toDatetimeLocalValue } from "@/lib/utils";

export function ArtworkForm({
  artwork,
  tags,
}: {
  artwork?: Artwork | null;
  tags: Tag[];
}) {
  const [imagePath, setImagePath] = useState(artwork?.image_path ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const selected = new Set(artwork?.tags?.map((tag) => tag.id) ?? []);

  async function onFileChange(file: File | null) {
    if (!file) return;
    setError(null);
    const body = new FormData();
    body.set("file", file);
    const result = await uploadArtworkImage(body);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    if ("path" in result && result.path) {
      setImagePath(result.path);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form
        action={(formData) => {
          startTransition(async () => {
            formData.set("image_path", imagePath);
            await saveArtworkAction(formData);
          });
        }}
        className="surface-panel space-y-5 rounded-[1.5rem] p-6"
      >
        {artwork ? <input type="hidden" name="id" value={artwork.id} /> : null}

        <label className="block space-y-2 text-sm">
          <span className="uppercase tracking-[0.16em] text-muted">Title</span>
          <input
            name="title"
            required
            defaultValue={artwork?.title}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
          />
        </label>

        <label className="block space-y-2 text-sm">
          <span className="uppercase tracking-[0.16em] text-muted">Caption</span>
          <textarea
            name="caption"
            rows={5}
            defaultValue={artwork?.caption}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block space-y-2 text-sm">
            <span className="uppercase tracking-[0.16em] text-muted">Medium</span>
            <input
              name="medium"
              defaultValue={artwork?.medium ?? ""}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="uppercase tracking-[0.16em] text-muted">Year</span>
            <input
              name="year"
              type="number"
              defaultValue={artwork?.year ?? ""}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="uppercase tracking-[0.16em] text-muted">Sort</span>
            <input
              name="sort_order"
              type="number"
              defaultValue={artwork?.sort_order ?? 0}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
            />
          </label>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm uppercase tracking-[0.16em] text-muted">
            Tags
          </legend>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <label
                key={tag.id}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-sm"
              >
                <input
                  type="checkbox"
                  name="tag_ids"
                  value={tag.id}
                  defaultChecked={selected.has(tag.id)}
                />
                {tag.name}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-5">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked={artwork?.is_published ?? true}
            />
            Published
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_featured"
              defaultChecked={artwork?.is_featured ?? false}
            />
            Pin to hero
          </label>
        </div>

        <label className="block space-y-2 text-sm">
          <span className="uppercase tracking-[0.16em] text-muted">
            Schedule publish
          </span>
          <input
            name="scheduled_at"
            type="datetime-local"
            defaultValue={toDatetimeLocalValue(artwork?.scheduled_at)}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
          />
          <span className="block text-xs text-muted">
            Leave empty to go live immediately when Published is checked.
          </span>
        </label>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={pending || (!imagePath && !artwork)}
          className="rounded-full bg-ink px-5 py-3 text-sm font-medium uppercase tracking-[0.14em] text-white transition hover:bg-accent disabled:opacity-50"
        >
          {pending ? "Saving…" : artwork ? "Save changes" : "Publish artwork"}
        </button>
      </form>

      <div className="space-y-4">
        <label className="surface-panel block rounded-[1.5rem] p-6">
          <span className="text-sm uppercase tracking-[0.16em] text-muted">
            Artwork image
          </span>
          <input
            type="file"
            accept="image/*"
            className="mt-3 block w-full text-sm"
            onChange={(event) =>
              void onFileChange(event.target.files?.[0] ?? null)
            }
          />
          {imagePath ? (
            <div className="relative mt-4 aspect-[4/5] overflow-hidden rounded-2xl bg-[#d7dee4]">
              <Image
                src={getPublicImageUrl(imagePath)}
                alt="Upload preview"
                fill
                className="object-cover"
                sizes="400px"
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">
              Upload a high-quality photo or scan. Max 20MB.
            </p>
          )}
        </label>

        {artwork ? (
          <form action={deleteArtworkAction}>
            <input type="hidden" name="id" value={artwork.id} />
            <input type="hidden" name="image_path" value={artwork.image_path} />
            <button
              type="submit"
              className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-700 transition hover:bg-red-50"
            >
              Delete artwork
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
