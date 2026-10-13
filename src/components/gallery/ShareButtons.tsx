"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { siteConfig } from "@/lib/config";

export function ShareButtons({
  title,
  path,
}: {
  title: string;
  path: string;
}) {
  const [copied, setCopied] = useState(false);
  const url = `${siteConfig.siteUrl.replace(/\/$/, "")}${path}`;

  function resolveUrl() {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${path}`;
    }
    return url;
  }

  async function shareNative() {
    const shareUrl = resolveUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title, text: title, url: shareUrl });
        return;
      } catch {
        // fall through to copy
      }
    }
    await copyLink();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(resolveUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => void shareNative()}
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-xs uppercase tracking-[0.14em] text-ink transition hover:border-ink"
      >
        <Share2 className="size-3.5" />
        Share
      </button>
      <button
        type="button"
        onClick={() => void copyLink()}
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-xs uppercase tracking-[0.14em] text-muted transition hover:border-ink hover:text-ink"
      >
        {copied ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
        {copied ? "Copied" : "Copy link"}
      </button>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface px-3.5 py-2 text-xs uppercase tracking-[0.14em] text-muted transition hover:border-ink hover:text-ink"
      >
        Facebook
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface px-3.5 py-2 text-xs uppercase tracking-[0.14em] text-muted transition hover:border-ink hover:text-ink"
      >
        X
      </a>
    </div>
  );
}
