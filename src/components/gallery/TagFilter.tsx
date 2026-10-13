"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Tag } from "@/lib/types";

export function TagFilter({ tags }: { tags: Tag[] }) {
  const params = useSearchParams();
  const active = params.get("tag");

  function hrefFor(slug?: string) {
    const next = new URLSearchParams(params.toString());
    next.delete("page");
    if (!slug || slug === active) next.delete("tag");
    else next.set("tag", slug);
    const query = next.toString();
    return query ? `/?${query}#gallery` : "/#gallery";
  }

  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={hrefFor()}
        className={cn(
          "rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em] transition",
          !active
            ? "border-ink bg-ink text-white"
            : "border-line bg-surface text-muted hover:border-ink hover:text-ink",
        )}
      >
        All
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={hrefFor(tag.slug)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em] transition",
            active === tag.slug
              ? "border-accent bg-accent text-white"
              : "border-line bg-surface text-muted hover:border-ink hover:text-ink",
          )}
        >
          {tag.name}
        </Link>
      ))}
    </div>
  );
}
